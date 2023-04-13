const { S3 } = require('@aws-sdk/client-s3');

const s3 = new S3({ apiVersion: '2006-03-01' });

function rssString(itemStrings) {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    `<channel>`,
    `<title>${process.env.FEED_NAME}</title>`,
    `<pubDate>${new Date().toUTCString()}</pubDate>`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `<ttl>60</ttl>`,
    `<language>en</language>`,
    itemStrings.join('\n'),
    `</channel>`,
    `</rss>`,
  ].join('\n');
}

function itemString(object) {
  const url = `https://${process.env.CDN_DOMAIN_NAME}/${object.Key}`;

  return [
    '<item>',
    `<guid isPermaLink="false">${object.ETag}</guid>`,
    `<title>${object.Key}</title>`,
    `<pubDate>${new Date(object.LastModified).toUTCString()}</pubDate>`,
    `<enclosure url="${url}" type="audio/mpeg" length="${object.Size}"/>`,
    '</item>',
  ].join('\n');
}

exports.handler = async () => {
  const list = await s3.listObjectsV2({ Bucket: process.env.BUCKET_NAME });
  const body = rssString(list.Contents.map(itemString));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/rss+xml; charset=UTF-8' },
    body,
  };
};
