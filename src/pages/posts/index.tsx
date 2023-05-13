import { GetServerSideProps, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getPrismicClient } from "../../services/prismic";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

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

export const getStaticProps: GetServerSideProps = async () => {
  const prismic = getPrismicClient();
  const session = await getSession();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100,
    }
  );

  const posts = response.results?.map((post) => {
    return {
      slug: post.uid,
      title: "dasd",
      exerpt: "dasda",
      updatedAt: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  });

  return {
    props: { posts, session },
  };
};
