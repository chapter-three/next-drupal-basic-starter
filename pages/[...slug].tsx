import * as React from "react"
import { GetStaticPathsResult, GetStaticPropsResult } from "next"
import Head from "next/head"
import {
  DrupalNode,
  getPathsFromContext,
  getResourceFromContext,
  getResourceTypeFromContext,
} from "next-drupal"

import { NodeArticle } from "@/components/node-article"
import { NodeBasicPage } from "@/components/node-basic-page"
import { Layout } from "@/components/layout"

interface NodePageProps {
  node: DrupalNode
}

export default function NodePage({ node }: NodePageProps) {
  if (!node) return null

  return (
    <Layout>
      <Head>
        <title>{node.title}</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>
      {node.type === "node--page" && <NodeBasicPage node={node} />}
      {node.type === "node--article" && <NodeArticle node={node} />}
    </Layout>
  )
}

export async function getStaticPaths(context): Promise<GetStaticPathsResult> {
  return {
    paths: await getPathsFromContext(["node--article", "node--page"], context),
    fallback: "blocking",
  }
}

export async function getStaticProps(
  context
): Promise<GetStaticPropsResult<NodePageProps>> {
  const type = await getResourceTypeFromContext(context)

  if (!type) {
    return {
      notFound: true,
    }
  }

  let params = {}
  if (type === "node--article") {
    params = {
      include: "field_image,uid",
    }
  }

  const node = await getResourceFromContext<DrupalNode>(type, context, {
    params,
  })

  if (!node?.status) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      node,
    },
    revalidate: 900,
  }
}
