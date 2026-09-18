// Read-only for Phase 3A — only what the quotation form's client
// selector needs (GET /clients). Creating a brand-new standalone
// client record (POST /clients) is out of scope here: the quotation
// create endpoint already accepts an inline `client` object for a
// one-off client, which is what the form's "new client" mode sends.
import { get } from './client'
import { fromWire } from './wireMapper'
import type { Client } from '@/types/client'

interface Envelope<T> {
  success: boolean
  data: T
}

export async function fetchClients(): Promise<Client[]> {
  const res = await get<Envelope<unknown[]>>('/clients')
  return fromWire<Client[]>(res.data)
}