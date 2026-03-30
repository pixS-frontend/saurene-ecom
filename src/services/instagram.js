const defaultPosts = [
  {
    id: "1",
    image: "/home_img_4.jpg",
    caption: "Grace in every thread."
  },
  {
    id: "2",
    image: "/home_img_5.jpeg",
    caption: "Soft silhouettes for bold moods."
  },
  {
    id: "3",
    image: "/home_img_6.jpeg",
    caption: "Vintage soul, modern spirit."
  }
];

export async function getInstagramPosts() {
  try {
    const response = await fetch("/api/instagram-feed");
    if (!response.ok) {
      return defaultPosts;
    }

    const payload = await response.json();
    const posts = payload?.posts || [];
    if (!posts.length) {
      return defaultPosts;
    }

    return posts;
  } catch {
    return defaultPosts;
  }
}
