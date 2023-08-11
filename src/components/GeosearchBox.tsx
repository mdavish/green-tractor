import { useState, useRef } from "react";
import { useSearchBoxCore } from "@mapbox/search-js-react";
import { Input } from "./ui/input";
import { ChangeEvent } from "react";
import {
  SearchBoxSuggestionResponse,
  SearchBoxFeatureSuggestion,
} from "@mapbox/search-js-core";
import { cn } from "@/lib/utils";
import { type Address } from "@/schemas/Address";
import { convertDisplayToValue } from "@/schemas/State";

export function transformMapboxToAddressData(
  feature: SearchBoxFeatureSuggestion
): Address {
  const { geometry } = feature;
  const { coordinates } = geometry;

  return {
    line1: feature.properties.context.address?.name!,
    city: feature.properties.context.place?.name!,
    region: convertDisplayToValue(feature.properties.context.region?.name!),
    postalCode: feature.properties.context.postcode?.name!,
    coordinates: {
      lat: coordinates[1],
      lng: coordinates[0],
    },
  };
}

interface GeosearchBoxProps {
  initialValue?: string;
  onSelect?: (address: Address) => void;
}

export default function GeosearchBox({
  initialValue,
  onSelect,
}: GeosearchBoxProps) {
  const searchBoxCore = useSearchBoxCore({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<
    SearchBoxSuggestionResponse | undefined
  >();
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [inputValue, setInputValue] = useState<string | undefined>(
    initialValue
  );

  const sessionToken = "whatever";

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length === 0) return;
    const results = await searchBoxCore.suggest(e.target.value, {
      sessionToken: sessionToken,
      country: "us",
      types: "address",
    });
    setResults(results);

    // If there is no selected index and there are results,
    // select the first result
    if (results?.suggestions.length && selectedIndex === undefined) {
      setSelectedIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results?.suggestions) {
      console.warn("No results");
      return;
    }

    if (e.key === "ArrowDown") {
      if (selectedIndex === undefined) {
        setSelectedIndex(0);
      } else if (selectedIndex === results?.suggestions.length - 1) {
        // Cycle back to the top
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    }

    if (e.key === "ArrowUp") {
      if (selectedIndex === undefined) {
        setSelectedIndex(0);
      } else if (selectedIndex === 0) {
        // Cycle back to the bottom
        setSelectedIndex(results?.suggestions.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    }

    if (e.key === "Enter") {
      handleFocus();
    }
  };

  // A selection can be triggered either by the enter key, or by clicking on a result
  // A few things happen here:
  // We use the .retrieve() endpoint to fetch the important metadata about the selected result
  // We blur the input
  // We change the input value to the selected result
  // We call the onSelect callback with the selected result
  async function handleSelection() {
    if (!results) {
      throw new Error("You are attempting to select a result with no results.");
    }
    if (selectedIndex === undefined) {
      throw new Error(
        "You are attempting to select a result with no selected index."
      );
    }

    const selectedSuggestion = results.suggestions[selectedIndex];

    // The UI updates immediately
    setInputValue(selectedSuggestion.full_address);
    setShowResults(false);

    // Next we retrieve the metadata from mapbox
    // (This comes from a separate endpoint, which is weird)
    const retrieveResponse = await searchBoxCore.retrieve(selectedSuggestion, {
      sessionToken,
    });
    // Unclear why this would ever return multiple?
    const firstFeature = retrieveResponse.features[0];
    if (!firstFeature) {
      throw new Error(
        "Mapbox Retrieve returned no features for the selected suggestion."
      );
    }
    const [lat, lng] = firstFeature.geometry.coordinates;
    const address = transformMapboxToAddressData(firstFeature);
    onSelect?.(address);
    inputRef.current?.blur();
  }

  const handleFocus = () => {
    setShowResults(true);
    if (!selectedIndex) {
      setSelectedIndex(0);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        placeholder="Search for a location..."
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={() => setShowResults(false)}
        onKeyDown={handleKeyDown}
      ></Input>
      {results && showResults && results.suggestions.length > 0 && (
        <div className="mt-1 absolute top-[100%] w-full bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col gap-y-2 text-sm">
          <div className="text-xs ml-2 mt-2 uppercase text-gray-600">
            Suggestions
          </div>
          {results.suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                className={cn(
                  "px-2 py-1 text-left hover:bg-gray-100 ]",
                  isSelected && "bg-gray-100"
                )}
                key={suggestion.mapbox_id}
                onClick={() => {
                  setSelectedIndex(index);
                  handleSelection();
                }}
              >
                <div>{suggestion.full_address}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
