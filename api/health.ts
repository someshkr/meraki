export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.status(200).json({ status: 'ok', datetime: new Date().toISOString(), platform: 'vercel' });
}
