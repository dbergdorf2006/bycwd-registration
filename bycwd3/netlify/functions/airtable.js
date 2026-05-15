exports.handler = async function (event) {
  const config = {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_TABLE_NAME || "Registrations",
  };

  if (!config.apiKey || !config.baseId) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Airtable environment variables not set on Netlify." }),
    };
  }

  const method = event.httpMethod;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const baseUrl = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`;
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    let url = baseUrl;
    let fetchOptions = { method, headers };

    if (method === "GET") {
      // Support pagination offset
      const params = event.queryStringParameters || {};
      if (params.offset) url += `?offset=${encodeURIComponent(params.offset)}`;
    } else if (method === "POST") {
      fetchOptions.body = event.body;
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
