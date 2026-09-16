import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(2, { message: "Name must have at least 2 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  phone: z.string().min(7, { message: "Valid phone number required" }),
  timezone: z.string().default("UTC"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "YYYY-MM-DD required" }),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, { message: "HH:MM required" }),
  birthCity: z.string().min(2, { message: "Birth city required" }),
  birthCountry: z.string().min(2, { message: "Birth country required" }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const ClientResponseSchema = CreateClientSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  status: z.enum(["active", "pending", "archived"]).default("active"),
});

export type ClientResponse = z.infer<typeof ClientResponseSchema>;
