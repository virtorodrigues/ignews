import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";
import Image from "next/image";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏🏼 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>
              for{" "}
              {new Intl.NumberFormat("pt-br", {
                currency: "BRL",
                style: "currency",
              }).format(product.amount)}{" "}
              month
            </span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

export const getServerSideProps: GetStaticProps = async () => {
  const price = (await stripe.prices.retrieve(
    "price_1JmnKTKne6GixzS7XnQga12c"
  )) as any;

  const product = {
    priceId: price.id,
    amount: price.unit_amount / 100,
  };

  return {
    props: {
      product,
      revalidate: 60 * 60 * 24, // 24hours
    },
  };
};
