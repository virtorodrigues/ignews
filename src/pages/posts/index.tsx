import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getPrismicClient } from "../../services/prismic";
import Prismic from "@prismicio/client";
import * as RichText from "@prismicio/richtext";
import * as prismicH from "@prismicio/helpers";

import styles from "./styles.module.scss";
import { getSession } from "next-auth/react";

interface Post {
  slug: string;
  title: string;
  exerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[];
  session: {
    activeSubscribe: boolean;
  };
}

export default function Posts({ posts, session }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts?.map((post) => (
            <Link
              key={post.slug}
              href={
                session?.activeSubscribe
                  ? `/posts/${post.slug}`
                  : `/posts/preview/${post.slug}`
              }
            >
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.exerpt}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const session = await getSession();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100,
    }
  );

  const posts = response.results?.map((post: any) => {
    return {
      slug: post.uid,
      title: prismicH.asText(post.data.title),
      exerpt:
        post.data.content.find((content: any) => content.type === "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: { posts, session },
  };
};
