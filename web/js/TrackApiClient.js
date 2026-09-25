export class TrackApiClient {
  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  async search({ term = "", provider = "all" } = {}) {
    const query = new URLSearchParams();
    if (term) query.set("q", term);
    if (provider !== "all") query.set("provider", provider);
    const response = await fetch(`${this.baseUrl}/tracks?${query}`);
    if (!response.ok) throw new Error(`API respondió ${response.status}`);
    return response.json();
  }
}