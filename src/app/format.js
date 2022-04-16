const FRENCH_MONTHS = {
  "Jan.": 0,
  "Fév.": 1,
  "Mar.": 2,
  "Avr.": 3,
  "Mai.": 4,
  "Jui.": 5,
  "Jui.": 6,
  "Aoû.": 7,
  "Sep.": 8,
  "Oct.": 9,
  "Nov.": 10,
  "Déc.": 11,
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("fr", { month: "short" }).format(date);
  const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const month = mo.charAt(0).toUpperCase() + mo.slice(1);
  return `${parseInt(da)} ${month.substr(0, 3)}. ${ye.toString().substr(2, 4)}`;
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};

// fonction uttilitaire permettant de convertire la date au format "Francais"

export const convertToDate = (formatedDate) => {
  let [day, month, year] = formatedDate.split(" ");

  year = parseInt(year);
  month = FRENCH_MONTHS[month];
  day = parseInt(day);

  return new Date(year, month, day);
};
