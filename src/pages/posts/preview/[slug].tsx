import { GetStaticProps } from "next";
import { getSession, useSession } from "next-auth/react";
import * as RichText from "@prismicio/richtext";
import Head from "next/head";
import { getPrismicClient } from "../../../services/prismic";
import Link from "next/link";

import styles from "../post.module.scss";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import { ParsedUrlQuery } from "querystring";
import * as prismicH from "@prismicio/helpers";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session, status, update } = useSession() as any;
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session, post, router]);

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">Subscribe now 🤗</Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as ParsedUrlQuery;

  const prismic = getPrismicClient();

  const response = (await prismic.getByUID("post", String(slug), {})) as any;

  const post = {
    slug,
    title: prismicH?.asText(response?.data.title),
    content: prismicH?.asHTML(response?.data.content.splice(0, 3)),
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
    revalidate: 60 * 30, //30 minutes
  };
};
