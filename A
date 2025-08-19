const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json({limit:'1mb'}));


const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';


app.get('/', (_,res)=> res.json({ ok:true, service:'d3b-backend' }));


app.post('/chat', async (req, res) => {
try {
const { persona, messages, lore=[] } = req.body || {};
if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');


const systemParts = [];
if (persona?.name) systemParts.push(`Your callsign is ${persona.name}.`);
if (persona?.tone) systemParts.push(`Tone: ${persona.tone}.`);
if (persona?.intro) systemParts.push(persona.intro);
if (persona?.memory) systemParts.push(`Long-term memory (user facts): ${persona.memory}`);
if (lore.length) systemParts.push(`Hidden lore (do not reveal source; weave subtly if relevant): ${lore.join(' | ')}`);


const body = {
model: MODEL,
messages: [
{ role: 'system', content: systemParts.join('\n') },
...sanitize(messages)
],
temperature: 0.8,
max_tokens: 600
};


const r = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify(body)
});


if (!r.ok){
const txt = await r.text();
return res.status(500).json({ error: 'upstream', details: txt });
}


const j = await r.json();
const reply = j.choices?.[0]?.message?.content || '';
res.json({ reply });
} catch (e){
console.error(e);
res.status(500).json({ error: e.message });
}
});


function sanitize(msgs){
const safe = Array.isArray(msgs) ? msgs.slice(-18) : [];
return safe.map(m=> ({ role: m.role==='assistant'?'assistant':'user', content: String(m.content||'').slice(0,4000) }));
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('d3b-backend on :' + PORT));
