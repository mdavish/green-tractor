"use client";
import Link from "next/link";
import { Listing, User, Offer } from "@prisma/client";
import { haversineDistance } from "@/lib/utils";
import { FaExclamationCircle } from "react-icons/fa";
import { Button } from "./ui/button";
import OfferButton from "./buttons/OfferButton";

interface ListingPreviewProps {
  listing: Listing & {
    listingUser: User;
  };
  currentUser: User;
  offers: Offer[];
}

export default function ListingPreview({
  listing,
  currentUser,
  offers,
}: ListingPreviewProps) {
  const shouldDisplayDistance =
    listing.listingUser.latitude &&
    listing.listingUser.longitude &&
    currentUser?.latitude &&
    currentUser?.longitude;

  const distance = shouldDisplayDistance
    ? haversineDistance(
        { lat: currentUser?.latitude!, lng: currentUser?.longitude! },
        {
          lat: listing.listingUser.latitude!,
          lng: listing.listingUser.longitude!,
        }
      )
    : null;

  const formattedDistance = distance?.toFixed(2);
  const listingIsTheirs = listing.listingUser.id === currentUser.id;

  const totalOffers = offers.length;
  const currentUserHasOffered = offers.some(
    (offer) => offer.offerUserId === currentUser.id
  );

  return (
    <div
      key={listing.id}
      className="border border-slate-300 shadow-sm px-4 py-5 rounded-md w-full flex flex-col-reverse md:flex-row"
    >
      <div className="flex flex-col gap-y-2">
        <Link href={`/dashboard/listings/${listing.id}`}>
          <h1 className="hover:underline font-medium">{listing.title}</h1>
        </Link>
        <p className="tracking-tight text-sm text-slate-700">
          {listing.description}
        </p>
        <div className="mt-2 flex flex-col gap-y-2 text-xs text-slate-500 gap-x-4">
          <p className="text-xs text-slate-500">
            Listed By {listingIsTheirs ? "Me" : listing.listingUser.name}
          </p>
          {shouldDisplayDistance ? (
            <p className="text-xs text-slate-500">
              {listing.listingUser.city}, {listing.listingUser.region} -{" "}
              {formattedDistance} miles away
            </p>
          ) : (
            <p className="text-red-700 flex flex-row">
              <FaExclamationCircle className="mr-1 my-auto" />
              No Location Available
            </p>
          )}{" "}
          <div className="flex md:flex-row gap-x-4">
            <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
            <p>
              Expires {new Date(listing.expirationDate).toLocaleDateString()}
            </p>
          </div>
          {totalOffers > 0 && (
            <p className="text-xs text-slate-500">
              {totalOffers} offer{totalOffers > 1 ? "s" : ""} submitted
            </p>
          )}
        </div>
      </div>
      <div className="md:ml-auto mr-4 my-auto flex flex-col">
        <h2 className="ml-auto text-2xl font-medium md:text-center">
          ${listing.startingPrice}
        </h2>
        <p className="text-white mt-2 text-xs md:text-gray-600 ml-auto flex flex-row mb-4">
          Starting Price
        </p>
        {/* If the current user has already offered, just take them to their current offer */}
        {/* TODO: Deep link directly to specific conversation */}
        {currentUserHasOffered && (
          <Link href={`/dashboard/inbox/`}>
            <Button className="ml-auto w-fit">View My Offer</Button>
          </Link>
        )}
        {!currentUserHasOffered && (
          <OfferButton
            listing={listing}
            currentUser={currentUser}
            buttonText="Make an Offer"
            buttonClassName="ml-auto w-fit"
          />
        )}
      </div>
    </div>
  );
}
