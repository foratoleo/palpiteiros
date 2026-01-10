# Geographic Restrictions - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/CLOB/geoblock
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Check geographic restrictions before placing orders on Polymarket's CLOB.

## Overview

Polymarket restricts order placement from certain geographic locations due to regulatory requirements and compliance with international sanctions. Before placing orders, builders should verify the location.

---

## Server Infrastructure

- **Primary Servers**: eu-west-2
- **Closest Non-Georestricted Region**: eu-west-1

---

## Geoblock Endpoint

Check the geographic eligibility of the requesting IP address:

```
GET https://polymarket.com/api/geoblock
```

### Response

```json
{
  "blocked": boolean,
  "ip": string,
  "country": string,
  "region": string
}
```

| Field | Type | Description |
| --- | --- | --- |
| `blocked` | boolean | Whether the user is blocked from placing orders |
| `ip` | string | Detected IP address |
| `country` | string | ISO 3166-1 alpha-2 country code |
| `region` | string | Region/state code |

---

## Blocked Countries

The following **33 countries** are completely restricted from placing orders on Polymarket:

| Country Code | Country Name |
| --- | --- |
| AU | Australia |
| BE | Belgium |
| BY | Belarus |
| BI | Burundi |
| CF | Central African Republic |
| CD | Congo (Kinshasa) |
| CU | Cuba |
| DE | Germany |
| ET | Ethiopia |
| FR | France |
| GB | United Kingdom |
| IR | Iran |
| IQ | Iraq |
| IT | Italy |
| KP | North Korea |
| LB | Lebanon |
| LY | Libya |
| MM | Myanmar |
| NI | Nicaragua |
| PL | Poland |
| RU | Russia |
| SG | Singapore |
| SO | Somalia |
| SS | South Sudan |
| SD | Sudan |
| SY | Syria |
| TH | Thailand |
| TW | Taiwan |
| UM | United States Minor Outlying Islands |
| US | United States |
| VE | Venezuela |
| YE | Yemen |
| ZW | Zimbabwe |

---

## Blocked Regions

In addition to fully blocked countries, the following specific regions within otherwise accessible countries are also restricted:

| Country | Region | Region Code |
| --- | --- | --- |
| Canada (CA) | Ontario | ON |
| Ukraine (UA) | Crimea | 43 |
| Ukraine (UA) | Donetsk | 14 |
| Ukraine (UA) | Luhansk | 09 |

---

## Usage Examples

### TypeScript

```typescript
interface GeoblockResponse {
  blocked: boolean;
  ip: string;
  country: string;
  region: string;
}

async function checkGeoblock(): Promise<GeoblockResponse> {
  const response = await fetch("https://polymarket.com/api/geoblock");
  return response.json();
}

// Usage
const geo = await checkGeoblock();

if (geo.blocked) {
  console.log(`Trading not available in ${geo.country}`);
} else {
  console.log("Trading available");
}
```

### Python

```python
import requests

def check_geoblock() -> dict:
    response = requests.get("https://polymarket.com/api/geoblock")
    return response.json()

# Usage
geo = check_geoblock()

if geo["blocked"]:
    print(f"Trading not available in {geo['country']}")
else:
    print("Trading available")
```
