import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import * as RichText from "@prismicio/richtext";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import * as prismicH from "@prismicio/helpers";

import styles from "./post.module.scss";
import { ParsedUrlQuery } from "querystring";

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { session } = (await getSession({ req })) as any;

  const { slug } = params as ParsedUrlQuery;

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  //if (!session) {
  //}

  const prismic = getPrismicClient(req);

  const response = (await prismic.getByUID("post", String(slug), {})) as any;

  const post = {
    slug,
    title: prismicH?.asText(response?.data.title),
    content: prismicH?.asHTML(response?.data.content),
    updatedAt: new Date(response?.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};
