import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [tier1Cities, setTier1Cities] = useState([]);
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("L1");
  const [rateType, setRateType] = useState("yearly");
  const [withBackfill, setWithBackfill] = useState("true");
  const [quantity, setQuantity] = useState(1);
  const [months, setMonths] = useState(12);
  const [days, setDays] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isOutOfHours, setIsOutOfHours] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [transitionCost, setTransitionCost] = useState(0);
  const [result, setResult] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Load regions, countries, tier1
  useEffect(() => {
    axios.get(`${API_BASE}/api/pricebook`).then((res) => {
      const uniqueRegions = [...new Set(res.data.map((row) => row.Region))];
      setRegions(uniqueRegions);
      setCountries(res.data);
    });

    axios.get(`${API_BASE}/api/tier1`).then((res) => {
      setTier1Cities(res.data.Tier1CitiesUSA);
    });
  }, []);

  const calculate = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/calc`, {
        params: {
          country,
          city: country === "United States of America (Tier 1)" ? city : null,
          level,
          rateType,
          withBackfill,
          quantity,
          months,
          days,
          distance,
          isWeekend,
          isOutOfHours,
          cancelled,
          accessDenied,
          transitionCost
        }
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Calculation failed");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>📘 Price Book Calculator</h2>

      {/* Region */}
      <div>
        <label>Region: </label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">-- Select Region --</option>
          {regions.map((r, i) => (
            <option key={i} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div>
        <label>Country: </label>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">-- Select Country --</option>
          {countries
            .filter((c) => !region || c.Region === region)
            .map((c, i) => (
              <option key={i} value={c.Country}>{c.Country}</option>
            ))}
        </select>
      </div>

      {/* City (for USA Tier 1) */}
      {country === "United States of America (Tier 1)" && (
        <div>
          <label>City: </label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">-- Select City --</option>
            {tier1Cities.map((ct, i) => (
              <option key={i} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      )}

      {/* Level */}
      <div>
        <label>Level: </label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="L1">L1</option>
          <option value="L2">L2</option>
          <option value="L3">L3</option>
          <option value="L4">L4</option>
          <option value="L5">L5</option>
        </select>
      </div>

      {/* Rate Type */}
      <div>
        <label>Rate Type: </label>
        <select value={rateType} onChange={(e) => setRateType(e.target.value)}>
          <option value="yearly">Yearly (Managed Service)</option>
          <option value="daily">Full Day (8 hrs)</option>
          <option value="halfday">Half Day (4 hrs)</option>
          <option value="dispatch">Dispatch Ticket SLA</option>
          <option value="dispatchIMAC">Dispatch IMAC SLA</option>
          <option value="projectShort">Project (Short Term, up to 3 months)</option>
          <option value="projectLong">Project (Long Term, 3+ months)</option>
        </select>
      </div>

      {/* With/Without Backfill */}
      {rateType === "yearly" && (
        <div>
          <label>Backfill: </label>
          <select value={withBackfill} onChange={(e) => setWithBackfill(e.target.value)}>
            <option value="true">With Backfill</option>
            <option value="false">Without Backfill</option>
          </select>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label>Quantity (Engineers): </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
      </div>

      {/* Duration */}
      {rateType === "yearly" && (
        <div>
          <label>Duration (Months): </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            min="1"
            max="12"
          />
        </div>
      )}
      {(rateType === "daily" || rateType === "halfday") && (
        <div>
          <label>Duration (Days): </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
          />
        </div>
      )}
      {(rateType === "projectShort" || rateType === "projectLong") && (
        <div>
          <label>Duration (Months): </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            min="1"
          />
        </div>
      )}

      {/* Distance */}
      <div>
        <label>Travel Distance (km): </label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
      </div>

      {/* Terms */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={isWeekend}
            onChange={(e) => setIsWeekend(e.target.checked)}
          />
          Weekend
        </label>
        <label>
          <input
            type="checkbox"
            checked={isOutOfHours}
            onChange={(e) => setIsOutOfHours(e.target.checked)}
          />
          Out of Hours
        </label>
        <label>
          <input
            type="checkbox"
            checked={cancelled}
            onChange={(e) => setCancelled(e.target.checked)}
          />
          Cancelled (within 24h)
        </label>
        <label>
          <input
            type="checkbox"
            checked={accessDenied}
            onChange={(e) => setAccessDenied(e.target.checked)}
          />
          Access Denied
        </label>
      </div>

      {/* Transition cost */}
      <div>
        <label>Transition Cost: </label>
        <input
          type="number"
          value={transitionCost}
          onChange={(e) => setTransitionCost(e.target.value)}
        />
      </div>

      <button onClick={calculate} style={{ marginTop: 15 }}>
        Calculate
      </button>

      {/* Result */}
      {result && (
        <div style={{ marginTop: 20, padding: 15, border: "1px solid #ccc", borderRadius: 5 }}>
          <h3>💰 Result</h3>
          <p><strong>Region:</strong> {result.region}</p>
          <p><strong>Country:</strong> {result.country}</p>
          {result.city && <p><strong>City:</strong> {result.city}</p>}
          <p><strong>Level:</strong> {result.level}</p>
          <p><strong>Rate Type:</strong> {result.rateType}</p>
          {result.rateType === "yearly" && (
            <p><strong>Backfill:</strong> {result.withBackfill === "true" ? "With Backfill" : "Without Backfill"}</p>
          )}
          <p><strong>Quantity:</strong> {result.quantity}</p>
          <p><strong>Duration:</strong> 
            {result.rateType === "yearly" && `${result.months} months`}
            {(result.rateType === "daily" || result.rateType === "halfday") && `${result.days} days`}
            {(result.rateType === "projectShort" || result.rateType === "projectLong") && `${result.months} months`}
          </p>
          <p><strong>Distance:</strong> {result.distance} km</p>
          <p><strong>Payment Terms:</strong> {result.paymentTerms}</p>
          <h4>Final Price: ${result.finalPrice}</h4>
        </div>
      )}
    </div>
  );
}

export default App;
