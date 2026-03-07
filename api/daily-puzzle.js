export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const response = await fetch(
    'https://lichess.org/api/puzzle/daily',
    { headers: { 'Accept': 'application/json' } }
  );
  
  const data = await response.json();
  res.status(200).json(data);
}