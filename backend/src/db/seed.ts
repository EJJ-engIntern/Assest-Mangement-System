import axios from 'axios';
import { supabase } from './supabase';

async function seed() {
  const { data } = await axios.get('https://dummyjson.com/products?limit=20');

  const assets = data.products.map((p: any) => ({
    name: p.title,
    category: p.category.includes('laptop') || p.category.includes('phone') ? 'hardware' : 'software',
    total_qty: Math.floor(Math.random() * 20) + 5,
    available: Math.floor(Math.random() * 10) + 1,
  }));

  const { error } = await supabase.from('assets').insert(assets);
  if (error) {
    console.error('Seed failed:', error.message);
  } else {
    console.log(`Seeded ${assets.length} assets`);
  }
}

seed();