let hkDistricts = [
    {
        "id": "HK-YT",
        "name": "Yau Tsim Mong",
        "area": "KL",
    },
    {
        "id": "HK-YL",
        "name": "Yuen Long",
        "area": "NT",
    },
    {
        "id": "HK-WT",
        "name": "Wong Tai Sin",
        "area": "KL",
    },
    {
        "id": "HK-WC",
        "name": "Wan Chai",
        "area": "HK",
    },
    {
        "id": "HK-TW",
        "name": "Tsuen Wan",
        "area": "NT",
    },
    {
        "id": "HK-TP",
        "name": "Tai Po",
        "area": "NT",
    },
    {
        "id": "HK-TM",
        "name": "Tuen Mun",
        "area": "NT",
    },
    {
        "id": "HK-ST",
        "name": "Sha Tin",
        "area": "NT",
    },
    {
        "id": "HK-SS",
        "name": "Sham Shui Po",
        "area": "KL",
    },
    {
        "id": "HK-SO",
        "name": "Southern",
        "area": "HK",
    },
    {
        "id": "HK-SK",
        "name": "Sai Kung",
        "area": "NT",
    },
    {
        "id": "HK-NO",
        "name": "North",
        "area": "NT",
    },
    {
        "id": "HK-KU",
        "name": "Kwun Tong",
        "area": "KL",
    },
    {
        "id": "HK-KI",
        "name": "Kwai Tsing",
        "area": "NT",
    },
    {
        "id": "HK-KC",
        "name": "Kowloon City",
        "area": "KL",
    },
    {
        "id": "HK-IS",
        "name": "Islands",
        "area": "NT",
    },
    {
        "id": "HK-EA",
        "name": "Eastern",
        "area": "HK",
    },
    {
        "id": "HK-CW",
        "name": "Central and Western",
        "area": "HK",
    }
]

hkDistricts = hkDistricts.sort((x, y) => [x.area, x.name] < [y.area, y.name] ? -1 : 1);
const hkAreas = [
    {id: "HK", name: "Hong Kong" },
    {id: "KL", name: "Kowloon" },
    {id: "NT", name: "New Territories" },
]
const hkAreas2Districts = {};
hkAreas.forEach(x => hkAreas2Districts[x.id] = hkDistricts.filter(y => y.area === x.id));

export { hkDistricts, hkAreas, hkAreas2Districts };