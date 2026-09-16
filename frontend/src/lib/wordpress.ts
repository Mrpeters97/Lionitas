import { GraphQLClient } from "graphql-request";

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string;

const client = new GraphQLClient(WORDPRESS_API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, next: { revalidate: 60 } }),
});

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  return client.request<T>(query, variables);
}

export interface WordPressPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage: WPImage | null;
  categories: { nodes: { name: string }[] };
}

export async function getPosts(): Promise<WordPressPost[]> {
  const query = /* GraphQL */ `
    query GetPosts {
      posts(first: 10) {
        nodes {
          id
          title
          slug
          date
          excerpt
          featuredImage { node { sourceUrl altText } }
          categories(first: 1) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: WordPressPost[] } }>(query);
  return data.posts.nodes;
}

export interface WPImage {
  node: {
    sourceUrl: string;
    altText: string;
  } | null;
}

export interface WPLink {
  url: string;
  title: string;
  target: string | null;
}

export interface ContentCard {
  title: string;
  image: WPImage | null;
  link: WPLink | null;
}

export interface ContentBlock {
  heading: string;
  text: string;
  buttonLabel: string;
  buttonLink: WPLink | null;
  image: WPImage | null;
  imagePosition: string[] | null;
  imageFocus: string[] | null;
}

export interface HomeContent {
  hero: {
    heading: string;
    text: string;
    backgroundImage: WPImage | null;
    primaryButtonLabel: string;
    primaryButtonLink: WPLink | null;
    secondaryButtonLabel: string;
    secondaryButtonLink: WPLink | null;
  };
  intro: {
    eyebrow: string;
    heading: string;
    text: string;
  };
  card1: ContentCard;
  card2: ContentCard;
  card3: ContentCard;
  contentBlock1: ContentBlock;
  contentBlock2: ContentBlock;
  faq: {
    heading: string;
    item1Question: string;
    item1Answer: string | null;
    item2Question: string;
    item2Answer: string | null;
    item3Question: string;
    item3Answer: string | null;
    item4Question: string;
    item4Answer: string | null;
    item5Question: string;
    item5Answer: string | null;
  };
  gallery: {
    image1: WPImage | null;
    image2: WPImage | null;
    image3: WPImage | null;
    image4: WPImage | null;
    image5: WPImage | null;
    image6: WPImage | null;
    image7: WPImage | null;
    image8: WPImage | null;
    image9: WPImage | null;
    image10: WPImage | null;
  };
}

const IMAGE_FRAGMENT = /* GraphQL */ `
  node {
    sourceUrl
    altText
  }
`;

const LINK_FRAGMENT = /* GraphQL */ `
  url
  title
  target
`;

export async function getHomeContent(): Promise<HomeContent> {
  const query = /* GraphQL */ `
    query GetHomeContent {
      page(id: "home", idType: URI) {
        homeContent {
          hero {
            heading
            text
            backgroundImage { ${IMAGE_FRAGMENT} }
            primaryButtonLabel
            primaryButtonLink { ${LINK_FRAGMENT} }
            secondaryButtonLabel
            secondaryButtonLink { ${LINK_FRAGMENT} }
          }
          intro {
            eyebrow
            heading
            text
          }
          card1 { title image { ${IMAGE_FRAGMENT} } link { ${LINK_FRAGMENT} } }
          card2 { title image { ${IMAGE_FRAGMENT} } link { ${LINK_FRAGMENT} } }
          card3 { title image { ${IMAGE_FRAGMENT} } link { ${LINK_FRAGMENT} } }
          contentBlock1 {
            heading
            text
            buttonLabel
            buttonLink { ${LINK_FRAGMENT} }
            image { ${IMAGE_FRAGMENT} }
            imagePosition
            imageFocus
          }
          contentBlock2 {
            heading
            text
            buttonLabel
            buttonLink { ${LINK_FRAGMENT} }
            image { ${IMAGE_FRAGMENT} }
            imagePosition
            imageFocus
          }
          faq {
            heading
            item1Question
            item1Answer
            item2Question
            item2Answer
            item3Question
            item3Answer
            item4Question
            item4Answer
            item5Question
            item5Answer
          }
          gallery {
            image1 { ${IMAGE_FRAGMENT} }
            image2 { ${IMAGE_FRAGMENT} }
            image3 { ${IMAGE_FRAGMENT} }
            image4 { ${IMAGE_FRAGMENT} }
            image5 { ${IMAGE_FRAGMENT} }
            image6 { ${IMAGE_FRAGMENT} }
            image7 { ${IMAGE_FRAGMENT} }
            image8 { ${IMAGE_FRAGMENT} }
            image9 { ${IMAGE_FRAGMENT} }
            image10 { ${IMAGE_FRAGMENT} }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ page: { homeContent: HomeContent } }>(query);
  return data.page.homeContent;
}

export interface SiteSettings {
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  social: {
    facebookUrl: string | null;
    instagramUrl: string | null;
    linkedinUrl: string | null;
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const query = /* GraphQL */ `
    query GetSiteSettings {
      page(id: "site-instellingen", idType: URI) {
        siteSettings {
          contact {
            address
            phone
            email
          }
          social {
            facebookUrl
            instagramUrl
            linkedinUrl
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ page: { siteSettings: SiteSettings } }>(query);
  return data.page.siteSettings;
}
