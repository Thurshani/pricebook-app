import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Calculator } from "lucide-react";

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
          transitionCost,
        },
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Calculation failed");
    }
  };

  const levelOptions =
    rateType === "daily" || rateType === "halfday"
      ? ["L1", "L2", "L3"]
      : ["L1", "L2", "L3", "L4", "L5"];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <Calculator className="header-icon" size={50} />
            <h1 className="header-title">Price Book Calculator</h1>
          </div>
          <p className="header-subtitle">
            Transform your pricing into beautiful quotes with our intelligent
            calculator
          </p>
        </div>
      </header>

      {/* Calculator */}
      <div className={`calculator-section ${result ? "" : "centered"}`}>
        <div className="form-card">
          <div className="form-grid">
            {/* Region */}
            <div className="form-group">
              <label htmlFor="region">Region</label>
              <select
                id="region"
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">-- Select Region --</option>
                {regions.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">-- Select Country --</option>
                {countries
                  .filter((c) => !region || c.Region === region)
                  .map((c, i) => (
                    <option key={i} value={c.Country}>{c.Country}</option>
                  ))}
              </select>
            </div>

            {/* City for USA Tier 1 */}
            {country === "United States of America (Tier 1)" && (
              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">-- Select City --</option>
                  {tier1Cities.map((ct, i) => (
                    <option key={i} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rate Type */}
            <div className="form-group">
              <label htmlFor="rateType">Rate Type</label>
              <select
                id="rateType"
                name="rateType"
                value={rateType}
                onChange={(e) => setRateType(e.target.value)}
              >
                <option value="yearly">Yearly (Managed Service)</option>
                <option value="daily">Full Day (8 hrs)</option>
                <option value="halfday">Half Day (4 hrs)</option>
                <option value="dispatch">Dispatch Ticket SLA</option>
                <option value="dispatchIMAC">Dispatch IMAC SLA</option>
                <option value="projectShort">Project (Short Term, up to 3 months)</option>
                <option value="projectLong">Project (Long Term, 3+ months)</option>
              </select>
            </div>

            {/* Level */}
            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {levelOptions.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Backfill */}
            {rateType === "yearly" && (
              <div className="form-group">
                <label htmlFor="backfill">Backfill</label>
                <select
                  id="backfill"
                  name="backfill"
                  value={withBackfill}
                  onChange={(e) => setWithBackfill(e.target.value)}
                >
                  <option value="true">With Backfill</option>
                  <option value="false">Without Backfill</option>
                </select>
              </div>
            )}

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>

            {/* Duration */}
            {rateType === "yearly" && (
              <div className="form-group">
                <label htmlFor="months">Duration (Months)</label>
                <input
                  id="months"
                  name="months"
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  min="1"
                  max="12"
                />
              </div>
            )}
            {(rateType === "daily" || rateType === "halfday") && (
              <div className="form-group">
                <label htmlFor="days">Duration (Days)</label>
                <input
                  id="days"
                  name="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  min="1"
                />
              </div>
            )}
            {(rateType === "projectShort" || rateType === "projectLong") && (
              <div className="form-group">
                <label htmlFor="months">Duration (Months)</label>
                <input
                  id="months"
                  name="months"
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  min="1"
                />
              </div>
            )}

            {/* Distance */}
            <div className="form-group">
              <label htmlFor="distance">Travel Distance (km)</label>
              <input
                id="distance"
                name="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            {/* Transition Cost */}
            <div className="form-group">
              <label htmlFor="transitionCost">Transition Cost</label>
              <input
                id="transitionCost"
                name="transitionCost"
                type="number"
                value={transitionCost}
                onChange={(e) => setTransitionCost(e.target.value)}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="checkbox-group">
            <label htmlFor="isWeekend">
              <input
                id="isWeekend"
                name="isWeekend"
                type="checkbox"
                checked={isWeekend}
                onChange={(e) => setIsWeekend(e.target.checked)}
              /> Weekend
            </label>

            <label htmlFor="isOutOfHours">
              <input
                id="isOutOfHours"
                name="isOutOfHours"
                type="checkbox"
                checked={isOutOfHours}
                onChange={(e) => setIsOutOfHours(e.target.checked)}
              /> Out of Hours
            </label>

            <label htmlFor="cancelled">
              <input
                id="cancelled"
                name="cancelled"
                type="checkbox"
                checked={cancelled}
                onChange={(e) => setCancelled(e.target.checked)}
              /> Cancelled
            </label>

            <label htmlFor="accessDenied">
              <input
                id="accessDenied"
                name="accessDenied"
                type="checkbox"
                checked={accessDenied}
                onChange={(e) => setAccessDenied(e.target.checked)}
              /> Access Denied
            </label>
          </div>

          <button className="calc-btn" onClick={calculate}>Calculate</button>
        </div>

        {/* Result */}
        {result && (
          <div className="result-card">
            <h3>Result</h3>
            <p><strong>Region:</strong> {result.region}</p>
            <p><strong>Country:</strong> {result.country}</p>
            {result.city && <p><strong>City:</strong> {result.city}</p>}
            <p><strong>Rate Type:</strong> {result.rateType}</p>
            <p><strong>Level:</strong> {result.level}</p>
            {result.rateType === "yearly" && (
              <p><strong>Backfill:</strong> {result.withBackfill === "true" ? "With Backfill" : "Without Backfill"}</p>
            )}
            <p><strong>Quantity:</strong> {result.quantity}</p>
            <p>
              <strong>Duration:</strong>{" "}
              {result.rateType === "yearly" && `${result.months} months`}
              {(result.rateType === "daily" || result.rateType === "halfday") && `${result.days} days`}
              {(result.rateType === "projectShort" || result.rateType === "projectLong") && `${result.months} months`}
            </p>
            <p><strong>Distance:</strong> {result.distance} km</p>
            <p><strong>Payment Terms:</strong> {result.paymentTerms}</p>
            <h4>Final Price: {result.currency} {result.finalPrice.toLocaleString()}</h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
