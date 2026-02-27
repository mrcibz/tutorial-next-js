'use server'

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']), // solo aceptamos estos dos valores
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // omitimos id y date porque se generan automáticamente
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createInvoice(formData: FormData) {
   // Validamos y transformamos los datos del formulario usando Zod 
   const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId') as string,
    amount: formData.get('amount') as string,
    status: formData.get('status') as 'pending' | 'paid',
  });
  const amountInCents = amount * 100; // para evitar problemas de precisión
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices'); // hacemos que la página de facturas se vuelva a renderizar para mostrar la nueva factura
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
  
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
