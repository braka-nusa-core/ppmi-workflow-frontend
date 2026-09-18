// Minimal master-data type — only the fields actually needed by the
// quotation client selector (Phase 3A scope). Mirrors `model Client`
// in schema.prisma.
export interface Client {
  id:            string
  clientCode:    string
  name:          string
  address:       string | null
  phone:         string | null
  email:         string | null
  contactPerson: string | null
  createdAt:     string
  updatedAt:     string
  deletedAt:     string | null
}