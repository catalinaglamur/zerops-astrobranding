import type {
  FrappeLeadInput,
  FrappeDealInput,
  FrappeCustomerInput,
  FrappeSalesInvoiceInput,
} from "@astrobranding/contracts";

export class FrappeClient {
  private url: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.url = (process.env.FRAPPE_URL || "").replace(/\/$/, "");
    this.apiKey = process.env.FRAPPE_API_KEY || "";
    this.apiSecret = process.env.FRAPPE_API_SECRET || "";
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `token ${this.apiKey}:${this.apiSecret}`,
    };
  }

  isConfigured(): boolean {
    return Boolean(this.url && this.apiKey && this.apiSecret);
  }

  async checkConnection(): Promise<{ ok: boolean; user?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { ok: false, error: "Frappe credentials not configured in environment" };
    }
    try {
      const res = await fetch(`${this.url}/api/method/frappe.auth.get_logged_user`, {
        headers: this.headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json() as { message?: string };
      return { ok: true, user: data.message };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : "Connection failed" };
    }
  }

  /**
   * Creates or updates a CRM Lead in Frappe CRM v1.83+
   */
  async createOrUpdateLead(lead: FrappeLeadInput): Promise<{ success: boolean; leadId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: true, leadId: `CRM-LEAD-MOCK-${Date.now()}` };
    }
    try {
      const res = await fetch(`${this.url}/api/resource/CRM Lead`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} creating CRM Lead`);
      const data = await res.json() as { data?: { name: string } };
      return { success: true, leadId: data.data?.name };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create CRM Lead" };
    }
  }

  /**
   * Creates or updates a CRM Deal in Frappe CRM (sets status="Won" on payment)
   */
  async createOrUpdateDeal(deal: FrappeDealInput): Promise<{ success: boolean; dealId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: true, dealId: `CRM-DEAL-MOCK-${Date.now()}` };
    }
    try {
      const res = await fetch(`${this.url}/api/resource/CRM Deal`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(deal),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} creating CRM Deal`);
      const data = await res.json() as { data?: { name: string } };
      return { success: true, dealId: data.data?.name };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create CRM Deal" };
    }
  }

  /**
   * Creates Customer in ERPNext
   */
  async createCustomer(customer: FrappeCustomerInput): Promise<{ success: boolean; customerName?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: true, customerName: customer.customer_name };
    }
    try {
      const res = await fetch(`${this.url}/api/resource/Customer`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} creating Customer`);
      const data = await res.json() as { data?: { name: string } };
      return { success: true, customerName: data.data?.name };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create Customer" };
    }
  }

  /**
   * Issues Sales Invoice in ERPNext (accounting record)
   */
  async createSalesInvoice(invoice: FrappeSalesInvoiceInput): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: true, invoiceId: `ACC-SINV-MOCK-${Date.now()}` };
    }
    try {
      const res = await fetch(`${this.url}/api/resource/Sales Invoice`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(invoice),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} creating Sales Invoice`);
      const data = await res.json() as { data?: { name: string } };
      return { success: true, invoiceId: data.data?.name };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create Sales Invoice" };
    }
  }
}

export const frappe = new FrappeClient();
