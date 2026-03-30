export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const limit = Number.parseInt(process.env.INSTAGRAM_FEED_LIMIT || "6", 10);

    if (!accessToken) {
      res.status(500).json({ message: "Missing INSTAGRAM_ACCESS_TOKEN" });
      return;
    }

    const fields = [
      "id",
      "caption",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
      "timestamp"
    ].join(",");

    const endpoint =
      `https://graph.instagram.com/me/media?fields=${encodeURIComponent(fields)}` +
      `&limit=${Number.isNaN(limit) ? 6 : limit}` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(endpoint);
    const payload = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        message: payload?.error?.message || "Instagram API request failed"
      });
      return;
    }

    const posts = (payload?.data || [])
      .filter((item) => item.media_type !== "VIDEO" || item.thumbnail_url || item.media_url)
      .map((item) => ({
        id: item.id,
        image: item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
        caption: item.caption || "Saurene",
        permalink: item.permalink || "https://www.instagram.com/saurene.official"
      }))
      .filter((item) => Boolean(item.image));

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to fetch Instagram posts" });
  }
}
