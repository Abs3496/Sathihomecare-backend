"use client";

import { useState } from "react";

export default function LocationSearch() {
  const [location, setLocation] = useState("");

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    window.location.href = params.toString() ? `/services?${params}` : "/services";
  }

  return (
    <form className="location-form" onSubmit={submit}>
      <input
        aria-label="Your city or locality"
        placeholder="Your city or locality"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
