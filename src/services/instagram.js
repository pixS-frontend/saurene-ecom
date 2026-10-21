const staticPosts = [
  "DeeUnlIE3aq",
  "DeTNxbmiVpr",
  "Dd_VUGvCQ4k",
  "Ddq_K94ieLt"
].map((id, recencyRank) => ({
  id,
  image: `/gram/${id}.jpg`,
  permalink: `https://www.instagram.com/p/${id}/`,
  alt: [
    "Model in a red vintage-inspired dress beside an ornate mirror",
    "A childhood dress-up photo paired with a model in a yellow Saurene dress",
    "Model in a yellow dress seated beside a vintage telephone",
    "Model in a pale blue dress with a red bow seated on a vintage sofa"
  ][recencyRank],
  recencyRank
}));

export async function getInstagramPosts() {
  return [...staticPosts]
    .map((post) => ({
      ...post,
      randomKey: -Math.log(Math.random() || Number.EPSILON) / Math.exp(-0.4 * post.recencyRank)
    }))
    .sort((a, b) => a.randomKey - b.randomKey)
    .map(({ randomKey, recencyRank, ...post }) => post);
}
