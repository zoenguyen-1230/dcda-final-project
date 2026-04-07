import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FilterChip } from "../../components/ui/FilterChip";
import { ScreenSurface } from "../../components/ui/ScreenSurface";
import { SectionCard } from "../../components/ui/SectionCard";
import {
  budgetSuggestions,
  cityWeatherForecasts,
  cheapFlightWindows,
  connections,
  nextVisitItinerary,
  packingChecklist,
  sharedBudgetSeed,
  tripToolkit,
  upcomingVisits,
} from "../../data/mockData";
import { locationDirectory } from "../../data/locationDirectory";
import { BudgetItem, FlightWindow, VisitPlan } from "../../types";
import { palette } from "../../theme/palette";

const budgetCategories = [
  "Food",
  "Transport",
  "Activities",
  "Stay",
  "Shopping",
  "Gifts",
  "Other",
];

const budgetPayers = ["You", "Sean", "Split"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function displayDateToInputValue(dateLabel: string) {
  const [monthName, dayWithComma, year] = dateLabel.split(" ");
  const monthIndex = monthNames.indexOf(monthName);
  const day = dayWithComma?.replace(",", "").padStart(2, "0");

  if (monthIndex < 0 || !day || !year) {
    return "";
  }

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`;
}

function inputValueToDisplayDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  const monthName = monthNames[Number(month) - 1];

  if (!year || !monthName || !day) {
    return "";
  }

  return `${monthName} ${Number(day)}, ${year}`;
}

function getDaysAway(dateValue: string) {
  const tripDate = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0
  );

  return Math.max(
    0,
    Math.ceil((tripDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function getTemperatureDisplay(
  temperatureRange: string,
  unit: "fahrenheit" | "celsius"
) {
  const [range = "0-0"] = temperatureRange.trim().split(" ");
  const [lowText = "0", highText = "0"] = range.split("-");
  const lowFahrenheit = Number.parseInt(lowText, 10);
  const highFahrenheit = Number.parseInt(highText, 10);

  if (Number.isNaN(lowFahrenheit) || Number.isNaN(highFahrenheit)) {
    return temperatureRange;
  }

  if (unit === "celsius") {
    const lowCelsius = Math.round(((lowFahrenheit - 32) * 5) / 9);
    const highCelsius = Math.round(((highFahrenheit - 32) * 5) / 9);

    return `${lowCelsius}-${highCelsius}\u00B0C`;
  }

  return `${lowFahrenheit}-${highFahrenheit}\u00B0F`;
}

export function TripsScreen() {
  const [trips, setTrips] = useState<VisitPlan[]>(upcomingVisits);
  const [selectedTripId, setSelectedTripId] = useState(upcomingVisits[0]?.id ?? "");
  const [tripDraftTitle, setTripDraftTitle] = useState(upcomingVisits[0]?.title ?? "");
  const [tripDraftLocation, setTripDraftLocation] = useState(upcomingVisits[0]?.location ?? "");
  const [tripDraftDate, setTripDraftDate] = useState(
    displayDateToInputValue(upcomingVisits[0]?.date ?? "")
  );
  const [tripDraftPlan, setTripDraftPlan] = useState(upcomingVisits[0]?.plan ?? "");
  const [tripDraftParticipantIds, setTripDraftParticipantIds] = useState<string[]>(
    upcomingVisits[0]?.participantIds ?? []
  );
  const [selectedFlightTrip, setSelectedFlightTrip] = useState(
    upcomingVisits[0]?.location ?? ""
  );
  const [flightWindows, setFlightWindows] = useState<FlightWindow[]>(cheapFlightWindows);
  const [draftFlightDateRange, setDraftFlightDateRange] = useState("");
  const [draftFlightPrice, setDraftFlightPrice] = useState("");
  const [draftFlightNote, setDraftFlightNote] = useState("");
  const [selectedVisitTitle, setSelectedVisitTitle] = useState(upcomingVisits[0]?.title ?? "");
  const [itineraryItems, setItineraryItems] = useState(nextVisitItinerary);
  const [completedItinerary, setCompletedItinerary] = useState<string[]>([
    nextVisitItinerary[0]?.id ?? "",
  ]);
  const [draftTime, setDraftTime] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetail, setDraftDetail] = useState("");
  const [selectedPackingTrip, setSelectedPackingTrip] = useState(
    upcomingVisits[0]?.location ?? ""
  );
  const [packingItems, setPackingItems] = useState(packingChecklist);
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [draftPackingLabel, setDraftPackingLabel] = useState("");
  const [selectedBudgetTrip, setSelectedBudgetTrip] = useState(
    upcomingVisits[0]?.location ?? ""
  );
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(sharedBudgetSeed);
  const [draftBudgetLabel, setDraftBudgetLabel] = useState("");
  const [draftBudgetCategory, setDraftBudgetCategory] = useState("");
  const [draftBudgetPayer, setDraftBudgetPayer] = useState("");
  const [draftBudgetAmount, setDraftBudgetAmount] = useState("");
  const [openBudgetCategoryMenu, setOpenBudgetCategoryMenu] = useState<string | null>(null);
  const [openBudgetPayerMenu, setOpenBudgetPayerMenu] = useState<string | null>(null);
  const [closedBudgetTrips, setClosedBudgetTrips] = useState<string[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<"fahrenheit" | "celsius">(
    "fahrenheit"
  );

  const isEditingExistingTrip = selectedTripId !== "";
  const tripLocationSuggestions = useMemo(() => {
    const query = tripDraftLocation.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return locationDirectory
      .filter((location) => location.label.toLowerCase().includes(query))
      .slice(0, 6);
  }, [tripDraftLocation]);

  const tripLocationMatch = useMemo(
    () =>
      locationDirectory.find(
        (location) => location.label.toLowerCase() === tripDraftLocation.trim().toLowerCase()
      ),
    [tripDraftLocation]
  );

  const visibleItinerary = useMemo(
    () => itineraryItems.filter((item) => item.visitTitle === selectedVisitTitle),
    [itineraryItems, selectedVisitTitle]
  );

  const visiblePackingItems = useMemo(
    () => packingItems.filter((item) => item.trip === selectedPackingTrip),
    [packingItems, selectedPackingTrip]
  );

  const visibleFlightWindows = useMemo(
    () => flightWindows.filter((item) => item.trip === selectedFlightTrip),
    [flightWindows, selectedFlightTrip]
  );

  const visibleBudgetItems = useMemo(
    () => budgetItems.filter((item) => item.trip === selectedBudgetTrip),
    [budgetItems, selectedBudgetTrip]
  );

  const budgetTotal = useMemo(
    () =>
      visibleBudgetItems.reduce(
        (total, item) => total + (Number.isFinite(item.amount) ? item.amount : 0),
        0
      ),
    [visibleBudgetItems]
  );

  const visibleBudgetSuggestions = useMemo(
    () => budgetSuggestions.filter((item) => item.trip === selectedBudgetTrip),
    [selectedBudgetTrip]
  );

  const visibleWeatherForecasts = useMemo(
    () =>
      cityWeatherForecasts.filter((forecast) =>
        trips.some((trip) => trip.location === forecast.city)
      ),
    [trips]
  );

  const isBudgetClosed = closedBudgetTrips.includes(selectedBudgetTrip);

  const toggleItinerary = (id: string) => {
    setCompletedItinerary((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const addItineraryItem = () => {
    const time = draftTime.trim();
    const title = draftTitle.trim();
    const detail = draftDetail.trim();

    if (!time || !title || !detail) {
      return;
    }

    setItineraryItems((current) => [
      ...current,
      {
        id: `itinerary-${Date.now()}`,
        visitTitle: selectedVisitTitle,
        time,
        title,
        detail,
      },
    ]);
    setDraftTime("");
    setDraftTitle("");
    setDraftDetail("");
  };

  const removeItineraryItem = (id: string) => {
    setItineraryItems((current) => current.filter((item) => item.id !== id));
    setCompletedItinerary((current) => current.filter((item) => item !== id));
  };

  const togglePackedItem = (id: string) => {
    setPackedItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const addPackingItem = () => {
    const label = draftPackingLabel.trim();

    if (!label) {
      return;
    }

    setPackingItems((current) => [
      ...current,
      { id: `packing-${Date.now()}`, label, trip: selectedPackingTrip },
    ]);
    setDraftPackingLabel("");
  };

  const updatePackingItem = (id: string, value: string) => {
    setPackingItems((current) =>
      current.map((item) => (item.id === id ? { ...item, label: value } : item))
    );
  };

  const removePackingItem = (id: string) => {
    setPackingItems((current) => current.filter((item) => item.id !== id));
    setPackedItems((current) => current.filter((item) => item !== id));
  };

  const addFlightWindow = () => {
    const dateRange = draftFlightDateRange.trim();
    const note = draftFlightNote.trim();
    const price = Number.parseFloat(draftFlightPrice);

    if (!dateRange || !note || Number.isNaN(price)) {
      return;
    }

    setFlightWindows((current) => [
      ...current,
      {
        id: `flight-${Date.now()}`,
        trip: selectedFlightTrip,
        dateRange,
        price,
        note,
      },
    ]);
    setDraftFlightDateRange("");
    setDraftFlightPrice("");
    setDraftFlightNote("");
  };

  const removeFlightWindow = (id: string) => {
    setFlightWindows((current) => current.filter((item) => item.id !== id));
  };

  const addBudgetItem = (item: BudgetItem) => {
    setBudgetItems((current) =>
      current.some((entry) => entry.id === item.id) ? current : [...current, item]
    );
  };

  const addCustomBudgetItem = () => {
    const label = draftBudgetLabel.trim();
    const category = draftBudgetCategory.trim();
    const payer = draftBudgetPayer.trim();
    const amount = Number.parseFloat(draftBudgetAmount);

    if (!label || !category || !payer || Number.isNaN(amount)) {
      return;
    }

    setBudgetItems((current) => [
      ...current,
      {
        id: `budget-${Date.now()}`,
        label,
        category,
        payer,
        amount,
        trip: selectedBudgetTrip,
      },
    ]);
    setDraftBudgetLabel("");
    setDraftBudgetCategory("");
    setDraftBudgetPayer("");
    setDraftBudgetAmount("");
  };

  const updateBudgetItem = (
    id: string,
    field: "label" | "category" | "payer" | "amount",
    value: string
  ) => {
    setBudgetItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "amount") {
          const numericValue = Number.parseFloat(value);
          return { ...item, amount: Number.isNaN(numericValue) ? 0 : numericValue };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems((current) => current.filter((item) => item.id !== id));
  };

  const closeBudgetTrip = () => {
    setClosedBudgetTrips((current) =>
      current.includes(selectedBudgetTrip) ? current : [...current, selectedBudgetTrip]
    );
  };

  const reopenBudgetTrip = () => {
    setClosedBudgetTrips((current) =>
      current.filter((trip) => trip !== selectedBudgetTrip)
    );
  };

  const loadTripIntoEditor = (tripId: string) => {
    const trip = trips.find((item) => item.id === tripId);

    if (!trip) {
      return;
    }

    setSelectedTripId(tripId);
    setTripDraftTitle(trip.title);
    setTripDraftLocation(trip.location);
    setTripDraftDate(displayDateToInputValue(trip.date));
    setTripDraftPlan(trip.plan);
    setTripDraftParticipantIds(trip.participantIds);
  };

  const saveTrip = () => {
    const title = tripDraftTitle.trim();
    const location = tripDraftLocation.trim();
    const dateValue = tripDraftDate.trim();
    const plan = tripDraftPlan.trim();

    if (!title || !location || !dateValue || !plan) {
      return;
    }

    const formattedDate = inputValueToDisplayDate(dateValue);
    if (!formattedDate) {
      return;
    }

    const existingTrip = trips.find((trip) => trip.id === selectedTripId);
    const nextTrip: VisitPlan = {
      id: existingTrip?.id ?? `visit-${Date.now()}`,
      title,
      location,
      date: formattedDate,
      daysAway: getDaysAway(dateValue),
      plan,
      participantIds: tripDraftParticipantIds,
    };

    if (existingTrip) {
      setTrips((current) =>
        current.map((trip) => (trip.id === existingTrip.id ? nextTrip : trip))
      );
      setItineraryItems((current) =>
        current.map((item) =>
          item.visitTitle === existingTrip.title
            ? { ...item, visitTitle: nextTrip.title }
            : item
        )
      );
      setPackingItems((current) =>
        current.map((item) =>
          item.trip === existingTrip.location ? { ...item, trip: nextTrip.location } : item
        )
      );
      setBudgetItems((current) =>
        current.map((item) =>
          item.trip === existingTrip.location ? { ...item, trip: nextTrip.location } : item
        )
      );
      setClosedBudgetTrips((current) =>
        current.map((trip) => (trip === existingTrip.location ? nextTrip.location : trip))
      );
      setSelectedVisitTitle((current) =>
        current === existingTrip.title ? nextTrip.title : current
      );
      setSelectedPackingTrip((current) =>
        current === existingTrip.location ? nextTrip.location : current
      );
      setSelectedBudgetTrip((current) =>
        current === existingTrip.location ? nextTrip.location : current
      );
      setSelectedTripId(existingTrip.id);
    } else {
      setTrips((current) => [...current, nextTrip]);
      setSelectedTripId(nextTrip.id);
      setSelectedVisitTitle(nextTrip.title);
      setSelectedPackingTrip(nextTrip.location);
      setSelectedBudgetTrip(nextTrip.location);
    }
  };

  const startNewTrip = () => {
    setSelectedTripId("");
    setTripDraftTitle("");
    setTripDraftLocation("");
    setTripDraftDate("");
    setTripDraftPlan("");
    setTripDraftParticipantIds([]);
  };

  const toggleTripParticipant = (connectionId: string) => {
    setTripDraftParticipantIds((current) =>
      current.includes(connectionId)
        ? current.filter((item) => item !== connectionId)
        : [...current, connectionId]
    );
  };

  const getParticipantNames = (participantIds: string[]) =>
    connections
      .filter((connection) => participantIds.includes(connection.id))
      .map((connection) => connection.name);

  const applyTripLocationSuggestion = (locationLabel: string) => {
    setTripDraftLocation(locationLabel);
  };

  return (
    <ScreenSurface>
      <SectionCard
        title="Trip editor"
        subtitle="Add or update visits together so countdowns, packing, itinerary, and budget stay aligned"
      >
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Choose a trip to edit</Text>
          <View style={styles.chipWrap}>
            {trips.map((trip) => (
              <FilterChip
                key={trip.id}
                label={trip.location}
                active={selectedTripId === trip.id}
                onPress={() => loadTripIntoEditor(trip.id)}
              />
            ))}
            <FilterChip label="New trip" active={selectedTripId === ""} onPress={startNewTrip} />
          </View>
        </View>

        <View style={styles.editorCard}>
          <Text style={styles.subsectionTitle}>
            {isEditingExistingTrip ? "Edit selected trip" : "Add a new trip"}
          </Text>
          <View style={styles.inputStack}>
            <TextInput value={tripDraftTitle} onChangeText={setTripDraftTitle} placeholder="Trip name" placeholderTextColor="#A08F89" style={styles.textInput} />
            <TextInput value={tripDraftLocation} onChangeText={setTripDraftLocation} placeholder="Location, ex: Austin, TX" placeholderTextColor="#A08F89" style={styles.textInput} />
            {tripLocationSuggestions.length ? (
              <View style={styles.suggestionList}>
                {tripLocationSuggestions.map((location) => (
                  <TouchableOpacity
                    key={location.label}
                    style={styles.suggestionRow}
                    onPress={() => applyTripLocationSuggestion(location.label)}
                  >
                    <Text style={styles.suggestionTitle}>{location.label}</Text>
                    <Text style={styles.suggestionMeta}>{location.timezone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {tripLocationMatch ? (
              <Text style={styles.helperMeta}>
                Suggested timezone: {tripLocationMatch.timezone}
              </Text>
            ) : null}
            <TextInput value={tripDraftDate} onChangeText={setTripDraftDate} placeholder="Date, YYYY-MM-DD" placeholderTextColor="#A08F89" style={styles.textInput} />
            <TextInput value={tripDraftPlan} onChangeText={setTripDraftPlan} placeholder="Description or shared checklist" placeholderTextColor="#A08F89" style={[styles.textInput, styles.detailInput]} multiline />
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Who is this trip with?</Text>
              <View style={styles.chipWrap}>
                {connections.map((connection) => (
                  <FilterChip
                    key={`trip-person-${connection.id}`}
                    label={connection.name}
                    active={tripDraftParticipantIds.includes(connection.id)}
                    onPress={() => toggleTripParticipant(connection.id)}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.rowMeta}>
            <Text style={styles.helperMeta}>
              Countdown preview: {tripDraftDate ? `${getDaysAway(tripDraftDate)} days away` : "add a date"}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={saveTrip}>
              <Text style={styles.primaryButtonText}>
                {isEditingExistingTrip ? "Save trip" : "Add trip"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Next visit countdown" subtitle="Make time together feel tangible">
        {trips.map((visit) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitBadge}>
              <Text style={styles.visitNumber}>{visit.daysAway}</Text>
              <Text style={styles.visitBadgeLabel}>days</Text>
            </View>
            <View style={styles.visitCopy}>
              <Text style={styles.feedTitle}>{visit.title}</Text>
              <Text style={styles.feedMeta}>{visit.date} | {visit.location}</Text>
              <Text style={styles.helperMeta}>
                With {getParticipantNames(visit.participantIds).join(", ") || "your people"}
              </Text>
              <Text style={styles.feedMeta}>{visit.plan}</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Visit itinerary" subtitle="Plan the next trip together so time feels intentional before you even arrive">
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Which visit are you planning?</Text>
          <View style={styles.chipWrap}>
            {trips.map((visit) => (
              <FilterChip
                key={visit.id}
                label={visit.location}
                active={selectedVisitTitle === visit.title}
                onPress={() => setSelectedVisitTitle(visit.title)}
              />
            ))}
          </View>
        </View>

        <View style={styles.editorCard}>
          <Text style={styles.subsectionTitle}>Add an itinerary item</Text>
          <View style={styles.inputStack}>
            <TextInput value={draftTime} onChangeText={setDraftTime} placeholder="Time block, ex: Sat night" placeholderTextColor="#A08F89" style={styles.textInput} />
            <TextInput value={draftTitle} onChangeText={setDraftTitle} placeholder="Title, ex: Botanical Garden date" placeholderTextColor="#A08F89" style={styles.textInput} />
            <TextInput value={draftDetail} onChangeText={setDraftDetail} placeholder="Details, ex: bring camera + stop for coffee after" placeholderTextColor="#A08F89" style={[styles.textInput, styles.detailInput]} multiline />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={addItineraryItem}>
            <Text style={styles.primaryButtonText}>Add to {selectedVisitTitle}</Text>
          </TouchableOpacity>
        </View>

        {visibleItinerary.map((item) => (
          <TouchableOpacity key={item.id} style={styles.toolCard} onPress={() => toggleItinerary(item.id)} activeOpacity={0.9}>
            <View style={[styles.toolBadge, completedItinerary.includes(item.id) && styles.toolBadgeComplete]}>
              <Text style={styles.toolBadgeLabel}>{item.time}</Text>
            </View>
            <View style={styles.toolCopy}>
              <Text style={styles.feedTitle}>{item.title}</Text>
              <Text style={styles.feedMeta}>{item.detail}</Text>
              <View style={styles.rowMeta}>
                <Text style={styles.helperMeta}>
                  {completedItinerary.includes(item.id) ? "Marked as planned together" : "Tap to mark this part of the trip as planned"}
                </Text>
                <TouchableOpacity onPress={() => removeItineraryItem(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {!visibleItinerary.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.feedMeta}>No itinerary items yet for this trip. Add the first plan above so you can build it together.</Text>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Trip toolkit" subtitle="Flights, weather, packing, and budgeting in one shared planning space">
        {tripToolkit.map((item) => (
          <View key={item.id} style={styles.toolCard}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeLabel}>{item.title}</Text>
            </View>
            <View style={styles.toolCopy}>
              <Text style={styles.feedMeta}>{item.detail}</Text>
            </View>
          </View>
        ))}

        <View style={styles.subsectionBlock}>
          <Text style={styles.subsectionTitle}>Cheap flight date windows</Text>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Choose a trip or city</Text>
            <View style={styles.chipWrap}>
              {trips.map((visit) => (
                <FilterChip
                  key={`flight-${visit.id}`}
                  label={visit.location}
                  active={selectedFlightTrip === visit.location}
                  onPress={() => setSelectedFlightTrip(visit.location)}
                />
              ))}
            </View>
          </View>

          <View style={styles.editorCard}>
            <Text style={styles.subsectionTitle}>Add a cheap-flight window</Text>
            <View style={styles.inputStack}>
              <TextInput
                value={draftFlightDateRange}
                onChangeText={setDraftFlightDateRange}
                placeholder="Date range, ex: May 16 - May 19"
                placeholderTextColor="#A08F89"
                style={styles.textInput}
              />
              <TextInput
                value={draftFlightPrice}
                onChangeText={setDraftFlightPrice}
                placeholder="Estimated fare, ex: 214"
                placeholderTextColor="#A08F89"
                style={styles.textInput}
                keyboardType="decimal-pad"
              />
              <TextInput
                value={draftFlightNote}
                onChangeText={setDraftFlightNote}
                placeholder="Why this window is good"
                placeholderTextColor="#A08F89"
                style={[styles.textInput, styles.detailInput]}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={addFlightWindow}>
              <Text style={styles.primaryButtonText}>Add flight window</Text>
            </TouchableOpacity>
          </View>

          {visibleFlightWindows.map((item) => (
            <View key={item.id} style={styles.tripSummaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryValue}>${item.price}</Text>
                  <Text style={styles.summaryLabel}>est. fare</Text>
                </View>
                <View style={styles.toolCopy}>
                  <Text style={styles.feedTitle}>{item.dateRange}</Text>
                  <Text style={styles.feedMeta}>{item.note}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeFlightWindow(item.id)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {!visibleFlightWindows.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.feedMeta}>
                No flight windows yet for this trip. Add one above to compare cheaper date options.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.subsectionBlock}>
          <View style={styles.rowMeta}>
            <Text style={styles.subsectionTitle}>Weather forecast by city</Text>
            <View style={styles.chipWrap}>
              <FilterChip
                label="°F"
                active={temperatureUnit === "fahrenheit"}
                onPress={() => setTemperatureUnit("fahrenheit")}
              />
              <FilterChip
                label="°C"
                active={temperatureUnit === "celsius"}
                onPress={() => setTemperatureUnit("celsius")}
              />
            </View>
          </View>
          {visibleWeatherForecasts.map((forecast) => (
            <View key={forecast.id} style={styles.weatherCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.weatherBadge}>
                  <Text style={styles.weatherIcon}>{forecast.icon}</Text>
                  <Text style={styles.weatherTemperature}>
                    {getTemperatureDisplay(forecast.temperatureRange, temperatureUnit)}
                  </Text>
                  <Text style={styles.summaryLabel}>forecast</Text>
                </View>
                <View style={styles.toolCopy}>
                  <Text style={styles.feedTitle}>{forecast.city}</Text>
                  <Text style={styles.feedMeta}>{forecast.summary}</Text>
                  <Text style={styles.helperMeta}>{forecast.packingNote}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.subsectionBlock}>
          <Text style={styles.subsectionTitle}>Packing checklist</Text>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Choose a trip or city</Text>
            <View style={styles.chipWrap}>
              {[...trips.map((visit) => visit.location), "Any trip"].map((trip) => (
                <FilterChip
                  key={trip}
                  label={trip}
                  active={selectedPackingTrip === trip}
                  onPress={() => setSelectedPackingTrip(trip)}
                />
              ))}
            </View>
          </View>

          <View style={styles.editorCard}>
            <Text style={styles.subsectionTitle}>Add a packing item</Text>
            <View style={styles.inputStack}>
              <TextInput
                value={draftPackingLabel}
                onChangeText={setDraftPackingLabel}
                placeholder={`Add an item for ${selectedPackingTrip}`}
                placeholderTextColor="#A08F89"
                style={styles.textInput}
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={addPackingItem}>
              <Text style={styles.primaryButtonText}>Add item</Text>
            </TouchableOpacity>
          </View>

          {visiblePackingItems.map((item) => (
            <View key={item.id} style={styles.checkEditorRow}>
              <TouchableOpacity style={styles.checkToggle} onPress={() => togglePackedItem(item.id)} activeOpacity={0.9}>
                <View style={[styles.checkCircle, packedItems.includes(item.id) && styles.checkCircleActive]}>
                  {packedItems.includes(item.id) ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
              </TouchableOpacity>
              <View style={styles.toolCopy}>
                <TextInput value={item.label} onChangeText={(value) => updatePackingItem(item.id, value)} placeholder="Packing item" placeholderTextColor="#A08F89" style={styles.textInput} />
                <Text style={styles.helperMeta}>{packedItems.includes(item.id) ? "Packed" : "Tap circle when packed"}</Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removePackingItem(item.id)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {!visiblePackingItems.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.feedMeta}>No packing items yet for this trip. Add a few essentials to start the checklist.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.subsectionBlock}>
          <Text style={styles.subsectionTitle}>Shared trip budget</Text>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Choose a trip or city</Text>
            <View style={styles.chipWrap}>
              {trips.map((visit) => (
                <FilterChip
                  key={visit.id}
                  label={visit.location}
                  active={selectedBudgetTrip === visit.location}
                  onPress={() => setSelectedBudgetTrip(visit.location)}
                />
              ))}
            </View>
          </View>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Current shared total</Text>
            <Text style={styles.totalValue}>${budgetTotal.toFixed(2)}</Text>
          </View>

          {isBudgetClosed ? (
            <View style={styles.closedSummaryCard}>
              <Text style={styles.feedTitle}>{selectedBudgetTrip} budget closed</Text>
              <Text style={styles.feedMeta}>
                {visibleBudgetItems.length} expenses recorded and reconciled for this trip.
              </Text>
              <TouchableOpacity style={styles.secondaryAction} onPress={reopenBudgetTrip}>
                <Text style={styles.secondaryActionText}>Reopen budget</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.editorCard}>
                <Text style={styles.subsectionTitle}>Add a custom expense</Text>
                <View style={styles.inputStack}>
                  <TextInput value={draftBudgetLabel} onChangeText={setDraftBudgetLabel} placeholder="Expense item, ex: dinner reservation" placeholderTextColor="#A08F89" style={styles.textInput} />
                  <View style={styles.selectWrap}>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setOpenBudgetCategoryMenu((current) => (current === "new" ? null : "new"))}>
                      <Text style={[styles.selectButtonText, !draftBudgetCategory && styles.selectPlaceholder]}>
                        {draftBudgetCategory || "Choose category"}
                      </Text>
                      <Text style={styles.selectChevron}>{openBudgetCategoryMenu === "new" ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                    {openBudgetCategoryMenu === "new" ? (
                      <View style={styles.optionList}>
                        {budgetCategories.map((category) => (
                          <TouchableOpacity key={category} style={styles.optionRow} onPress={() => { setDraftBudgetCategory(category); setOpenBudgetCategoryMenu(null); }}>
                            <Text style={styles.optionText}>{category}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.selectWrap}>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setOpenBudgetPayerMenu((current) => (current === "new" ? null : "new"))}>
                      <Text style={[styles.selectButtonText, !draftBudgetPayer && styles.selectPlaceholder]}>
                        {draftBudgetPayer || "Who paid?"}
                      </Text>
                      <Text style={styles.selectChevron}>{openBudgetPayerMenu === "new" ? "▲" : "▼"}</Text>
                    </TouchableOpacity>
                    {openBudgetPayerMenu === "new" ? (
                      <View style={styles.optionList}>
                        {budgetPayers.map((payer) => (
                          <TouchableOpacity key={payer} style={styles.optionRow} onPress={() => { setDraftBudgetPayer(payer); setOpenBudgetPayerMenu(null); }}>
                            <Text style={styles.optionText}>{payer}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <TextInput value={draftBudgetAmount} onChangeText={setDraftBudgetAmount} placeholder="Amount, ex: 42" placeholderTextColor="#A08F89" style={styles.textInput} keyboardType="decimal-pad" />
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={addCustomBudgetItem}>
                  <Text style={styles.primaryButtonText}>Add expense</Text>
                </TouchableOpacity>
              </View>

              {visibleBudgetItems.map((item) => (
                <View key={item.id} style={styles.budgetEditorRow}>
                  <View style={styles.budgetFieldStack}>
                    <TextInput value={item.label} onChangeText={(value) => updateBudgetItem(item.id, "label", value)} placeholder="Expense item" placeholderTextColor="#A08F89" style={styles.textInput} />
                    <View style={styles.budgetMetaRow}>
                      <View style={[styles.selectWrap, styles.metaInput]}>
                        <TouchableOpacity style={styles.selectButton} onPress={() => setOpenBudgetCategoryMenu((current) => (current === item.id ? null : item.id))}>
                          <Text style={styles.selectButtonText}>{item.category}</Text>
                          <Text style={styles.selectChevron}>{openBudgetCategoryMenu === item.id ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                        {openBudgetCategoryMenu === item.id ? (
                          <View style={styles.optionList}>
                            {budgetCategories.map((category) => (
                              <TouchableOpacity key={`${item.id}-${category}`} style={styles.optionRow} onPress={() => { updateBudgetItem(item.id, "category", category); setOpenBudgetCategoryMenu(null); }}>
                                <Text style={styles.optionText}>{category}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : null}
                      </View>
                      <View style={[styles.selectWrap, styles.metaInput]}>
                        <TouchableOpacity style={styles.selectButton} onPress={() => setOpenBudgetPayerMenu((current) => (current === item.id ? null : item.id))}>
                          <Text style={styles.selectButtonText}>{item.payer}</Text>
                          <Text style={styles.selectChevron}>{openBudgetPayerMenu === item.id ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                        {openBudgetPayerMenu === item.id ? (
                          <View style={styles.optionList}>
                            {budgetPayers.map((payer) => (
                              <TouchableOpacity key={`${item.id}-${payer}`} style={styles.optionRow} onPress={() => { updateBudgetItem(item.id, "payer", payer); setOpenBudgetPayerMenu(null); }}>
                                <Text style={styles.optionText}>{payer}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : null}
                      </View>
                      <TextInput value={item.amount ? item.amount.toString() : ""} onChangeText={(value) => updateBudgetItem(item.id, "amount", value)} placeholder="0" placeholderTextColor="#A08F89" style={[styles.textInput, styles.amountInput]} keyboardType="decimal-pad" />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeBudgetItem(item.id)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {!visibleBudgetItems.length ? (
                <View style={styles.emptyState}>
                  <Text style={styles.feedMeta}>No expenses recorded yet for this trip. Add the first one to start the budget.</Text>
                </View>
              ) : null}

              <Text style={styles.controlLabel}>Quick add shared expenses</Text>
              {visibleBudgetSuggestions.map((item) => {
                const alreadyAdded = budgetItems.some((entry) => entry.id === item.id);

                return (
                  <TouchableOpacity key={item.id} style={[styles.budgetRow, alreadyAdded && styles.budgetRowDisabled]} onPress={() => addBudgetItem(item)} disabled={alreadyAdded} activeOpacity={0.9}>
                    <View style={styles.toolCopy}>
                      <Text style={styles.feedMeta}>{item.label}</Text>
                      <Text style={styles.helperMeta}>
                        {item.category} | {item.payer} paid | ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.addBudgetText}>{alreadyAdded ? "Added" : "Add"}</Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.secondaryAction} onPress={closeBudgetTrip}>
                <Text style={styles.secondaryActionText}>Close out this trip budget</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SectionCard>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  visitCard: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    backgroundColor: palette.softSun,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1E3C8",
  },
  visitBadge: {
    width: 78,
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#EFDDB7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  visitNumber: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 36,
  },
  visitBadgeLabel: {
    color: palette.berry,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  visitCopy: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  toolCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  toolBadge: {
    minWidth: 76,
    borderRadius: 18,
    backgroundColor: "#FFF1E7",
    borderWidth: 1,
    borderColor: "#F4E6DF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  toolBadgeComplete: {
    backgroundColor: palette.mint,
    borderColor: "#CDEBDD",
  },
  toolBadgeLabel: {
    color: palette.berry,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.6,
  },
  toolCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 1,
  },
  controlGroup: {
    gap: 8,
  },
  controlLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  editorCard: {
    gap: 12,
    backgroundColor: "#FFF8F2",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  inputStack: {
    gap: 10,
  },
  textInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.text,
    fontSize: 14,
  },
  detailInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  helperMeta: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "700",
  },
  rowMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  removeText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  emptyState: {
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  subsectionBlock: {
    gap: 10,
    paddingTop: 4,
  },
  subsectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
  },
  checkEditorRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  checkToggle: {
    paddingTop: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7C1CF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkCircleActive: {
    backgroundColor: palette.berry,
    borderColor: palette.berry,
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  totalCard: {
    backgroundColor: palette.softSun,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E3C8",
    padding: 16,
    gap: 4,
  },
  totalLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  totalValue: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "900",
  },
  closedSummaryCard: {
    gap: 10,
    backgroundColor: palette.softSun,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E3C8",
    padding: 16,
  },
  tripSummaryCard: {
    gap: 10,
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  weatherCard: {
    gap: 6,
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  summaryHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  summaryBadge: {
    width: 88,
    minHeight: 88,
    borderRadius: 22,
    backgroundColor: palette.softSun,
    borderWidth: 1,
    borderColor: "#F1E3C8",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 2,
  },
  weatherBadge: {
    width: 88,
    minHeight: 88,
    borderRadius: 22,
    backgroundColor: palette.softSun,
    borderWidth: 1,
    borderColor: "#F1E3C8",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 2,
  },
  weatherIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
  summaryValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
  },
  weatherTemperature: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 21,
  },
  summaryLabel: {
    color: palette.berry,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  budgetRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  budgetRowDisabled: {
    opacity: 0.7,
  },
  budgetEditorRow: {
    gap: 10,
    backgroundColor: "#FFF8F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  budgetFieldStack: {
    gap: 10,
  },
  budgetMetaRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaInput: {
    flex: 1,
  },
  amountInput: {
    width: 96,
  },
  selectWrap: {
    gap: 6,
  },
  selectButton: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectButtonText: {
    color: palette.text,
    fontSize: 14,
    flex: 1,
  },
  selectPlaceholder: {
    color: "#A08F89",
  },
  selectChevron: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "800",
  },
  optionList: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  optionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5E8E2",
  },
  optionText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionList: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5E8E2",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  suggestionTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  suggestionMeta: {
    color: palette.berry,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  removeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF1E7",
    borderWidth: 1,
    borderColor: "#F4E6DF",
  },
  removeButtonText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  secondaryAction: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  addBudgetText: {
    color: palette.berry,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  feedTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  feedMeta: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
