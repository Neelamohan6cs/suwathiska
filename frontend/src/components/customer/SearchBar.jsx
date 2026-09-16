import { useState } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";


export default function SearchBar({ value, onSearch, placeholder = "Search for pellets, cattle feed…", className = "" }) {
  const [query, setQuery] = useState(value || "");

  const submit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const clear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={submit} className={`relative w-full ${className}`}>
      <HiMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-dairy-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-9"
        aria-label="Search products"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60"
          aria-label="Clear search"
        >
          <HiXMark className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
