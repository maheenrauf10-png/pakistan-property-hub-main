export const CITIES = [
  'Karachi',
  'Lahore', 
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot',
] as const;

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'farmhouse', label: 'Farmhouse' },
] as const;

export const LISTING_TYPES = [
  { value: 'rent', label: 'For Rent', color: 'property-rent' },
  { value: 'sale', label: 'For Sale', color: 'property-sale' },
  { value: 'land', label: 'Land', color: 'property-land' },
] as const;

export const SIZE_UNITS = [
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'sqyd', label: 'Sq. Yd.' },
] as const;

export const PRICE_UNITS = [
  { value: 'total', label: 'Total Price' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' },
  { value: 'per_marla', label: 'Per Marla' },
  { value: 'per_kanal', label: 'Per Kanal' },
] as const;

export const AMENITIES = [
  'Parking',
  'Security',
  'Electricity Backup',
  'Gas',
  'Water Supply',
  'Central Heating',
  'Central Cooling',
  'Lawn/Garden',
  'Swimming Pool',
  'Gym',
  'Elevator',
  'Servant Quarter',
  'Study Room',
  'Store Room',
  'Balcony',
  'Terrace',
  'Drawing Room',
  'Dining Room',
  'Kitchen',
  'Laundry',
  'Internet',
  'Cable TV',
  'Intercom',
  'CCTV',
  'Boundary Wall',
  'Corner Plot',
  'Park Facing',
  'Main Boulevard',
] as const;

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} Lac`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K`;
  }
  return price.toLocaleString();
};

export const formatPriceWithUnit = (price: number, unit: string): string => {
  const formattedPrice = formatPrice(price);
  switch (unit) {
    case 'monthly':
      return `PKR ${formattedPrice}/month`;
    case 'yearly':
      return `PKR ${formattedPrice}/year`;
    case 'per_marla':
      return `PKR ${formattedPrice}/marla`;
    case 'per_kanal':
      return `PKR ${formattedPrice}/kanal`;
    default:
      return `PKR ${formattedPrice}`;
  }
};
