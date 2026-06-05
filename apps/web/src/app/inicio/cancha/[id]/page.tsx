"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { useParams } from "next/navigation";

// Mock venue data
const venues: Record<string, any> = {
  "1": {
    id: 1,
    name: "Stadium El Clásico",
    location: "Av. de los Deportes 450, Buenos Aires",
    rating: 4.9,
    reviews: 120,
    size: "5 vs 5",
    surface: "Synthetic G3",
    lights: "LED Pro",
    amenities: "Showers",
    price: "$45.00",
    time: "Friday, May 24th",
    slots: "12 slots open",
    description:
      "Experience football at its finest in our high-performance arena. Featuring the latest generation of synthetic turf approved by international standards, our pitch ensures optimal ball roll and player safety. Whether it's a competitive tournament or a friendly match with colleagues, our facility provides the perfect floodlit environment for peak performance.",
    images: [
      "https://i.pinimg.com/736x/62/04/21/62042179e162da00c410e70b5aac2ab8.jpg",
      "https://i.pinimg.com/736x/77/73/de/7773de8e2480621c7c9ed9d348281c7a.jpg",
      "https://i.pinimg.com/736x/dd/f5/68/ddf5687ae760d60764a9be38d9247ea5.jpg",
      "https://i.pinimg.com/736x/a3/71/de/a371de7d55fabb6f9f78594d241d1ee7.jpg",
    ],
  },
  "2": {
    id: 2,
    name: "The Wembley Club",
    location: "Centro Histórico, Distrito Deportes, Buenos Aires",
    rating: 4.7,
    reviews: 98,
    size: "11 vs 11",
    surface: "Natural Grass",
    lights: "Stadium Lights",
    amenities: "Showers, Bar, Stands",
    price: "$62.00",
    time: "Saturday, May 25th",
    slots: "8 slots open",
    description:
      "Premium venue with natural grass pitch. Perfect for competitive matches with full stadium amenities.",
    images: [
      "https://i.pinimg.com/736x/dd/f5/68/ddf5687ae760d60764a9be38d9247ea5.jpg",
      "https://i.pinimg.com/736x/77/73/de/7773de8e2480621c7c9ed9d348281c7a.jpg",
    ],
  },
  "3": {
    id: 3,
    name: "Arena Champions",
    location: "Suba, Av. Principal, Buenos Aires",
    rating: 4.5,
    reviews: 75,
    size: "5 vs 5",
    surface: "Synthetic Pro",
    lights: "LED 4k",
    amenities: "Wifi, Parking",
    price: "$38.00",
    time: "Sunday, May 26th",
    slots: "15 slots open",
    description:
      "Modern indoor facility with 4K LED lighting and fast synthetic surface. Great for quick-paced games.",
    images: [
      "https://i.pinimg.com/736x/62/04/21/62042179e162da00c410e70b5aac2ab8.jpg",
    ],
  },
};

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;
  const venue = venues[venueId];

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#0e150e] text-[#dce5d9] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Cancha no encontrada</h1>
          <Link href="/" className="text-[#4be176] hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e150e] text-[#dce5d9]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-slate-900/60 backdrop-blur-xl rounded-full mt-6 mx-auto w-[95%] max-w-7xl border border-white/10 shadow-2xl shadow-green-500/10">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white italic">
            Picadito
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Teams
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Live Stats
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold uppercase">
            Login
          </Link>
          <Link href="/register" className="bg-[#21c45d] text-[#004a1d] px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-[#1fb854] transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Hero Image Section */}
        <div className="relative h-96 mb-12 rounded-xl overflow-hidden border border-white/10">
          <img className="w-full h-full object-cover" src={venue.images[0]} alt={venue.name} />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-[#4be176]/90 text-[#003915] text-xs font-bold px-3 py-1 rounded-full">
              PREMIUM VENUE
            </span>
            <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">TOP RATED</span>
          </div>
        </div>

        {/* Title & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-5xl font-bold text-white mb-4">{venue.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#4be176]" />
                <p className="text-[#bccbb9]">{venue.location}</p>
              </div>
              <div className="flex items-center gap-2 text-[#4be176]">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">
                  {venue.rating} ({venue.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Field Specifications */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Field Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <p className="text-xs font-bold text-[#869585] mb-2">CAPACITY</p>
                  <p className="text-2xl font-bold text-white">{venue.size}</p>
                </div>
                <div className="bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <p className="text-xs font-bold text-[#869585] mb-2">SURFACE</p>
                  <p className="text-lg font-bold text-white">{venue.surface}</p>
                </div>
                <div className="bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <p className="text-xs font-bold text-[#869585] mb-2">LIGHTING</p>
                  <p className="text-lg font-bold text-white">{venue.lights}</p>
                </div>
                <div className="bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <p className="text-xs font-bold text-[#869585] mb-2">AMENITIES</p>
                  <p className="text-lg font-bold text-white">{venue.amenities}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">About the Venue</h3>
              <p className="text-[#bccbb9] leading-relaxed">{venue.description}</p>
            </div>

            {/* Location Map */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Location</h3>
              <div className="bg-[#1a221a] border border-[#3d4a3d] rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-[#4be176] mx-auto mb-2" />
                  <p className="text-[#bccbb9] mb-2">Map would be displayed here</p>
                  <a href="#" className="text-[#4be176] font-bold hover:underline">
                    Get Directions Opens in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Venue Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {venue.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#3d4a3d] hover:border-[#4be176] transition-colors">
                    <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" src={img} alt={`Gallery ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 sticky top-32">
              <div className="mb-6">
                <p className="text-xs font-bold text-[#869585] mb-2">STARTING FROM</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#4be176]">{venue.price}</span>
                  <span className="text-[#bccbb9]">/hour</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <Clock className="h-5 w-5 text-[#4be176]" />
                  <div>
                    <p className="text-xs font-bold text-[#869585]">DATE</p>
                    <p className="text-white font-bold">{venue.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#1a221a] rounded-lg p-4 border border-[#3d4a3d]">
                  <Users className="h-5 w-5 text-[#4be176]" />
                  <div>
                    <p className="text-xs font-bold text-[#869585]">AVAILABLE SLOTS</p>
                    <p className="text-white font-bold">{venue.slots}</p>
                  </div>
                </div>
              </div>

              <Link
                href={`/inicio/cancha/${venue.id}/turnos`}
                className="block w-full bg-[#4be176] text-[#003915] py-3 rounded-lg font-bold uppercase mb-4 hover:bg-[#3dd66e] transition-colors text-center"
              >
                Seleccionar Turno
              </Link>

              <div className="space-y-2 text-xs text-[#bccbb9]">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Free cancelation up to 24h before</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-slate-900 mt-20">
        <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
          <span className="text-lg font-bold text-white">Picadito</span>
          <p className="text-xs text-slate-500 max-w-xs text-center md:text-left uppercase tracking-widest leading-loose">
            © 2024 Picadito by TriaSoft. All rights reserved. Engineered for the pitch.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">
            Privacy
          </a>
          <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">
            Terms
          </a>
          <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">
            Support
          </a>
          <a href="#" className="text-xs text-slate-500 hover:text-[#4be176] transition-colors uppercase font-bold">
            API Status
          </a>
        </div>
      </footer>
    </div>
  );
}
