"use client";
import Link from "next/link";
import { Listing, User, Offer, ListingStatus } from "@prisma/client";
import { haversineDistance } from "@/lib/utils";
import { FaExclamationCircle } from "react-icons/fa";
import { Button } from "./ui/button";
import OfferButton from "./buttons/OfferButton";
import Pill from "./Pill";

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
      className="border border-slate-300 shadow-sm px-4 py-5 rounded-md w-full flex flex-col md:flex-row gap-x-3"
    >
      <div className="mx-auto md:mx-0 w-56 h-64 shrink-0 bg-slate-200 rounded-lg shadow-sm flex">
        <h1 className="mx-auto my-auto text-slate-900 text-2xl text-center">
          Image <br /> Placeholder
        </h1>
      </div>
      <div className="my-auto p-4 flex-col gap-y-2 w-full shrink">
        <div className="flex flex-col gap-y-2">
          <Link
            className="mx-auto md:mx-0"
            href={`/dashboard/listings/${listing.id}`}
          >
            {listing.status !== "OPEN" && (
              <Pill
                className="mb-2"
                text={listing.status}
                color={listing.status === "SOLD" ? "green" : "red"}
              />
            )}
            <h1 className="hover:underline text-lg font-medium">
              {listing.title}
            </h1>
          </Link>
          <p className="mx-auto md:mx-0 text-center md:text-left tracking-tight text-sm text-slate-700">
            {listing.description}
          </p>
        </div>
        <div className="mt-2 flex flex-col gap-y-2 text-xs text-slate-500 gap-x-4">
          <p className="mx-auto md:mx-0  text-xs text-slate-500">
            Listed By {listingIsTheirs ? "Me" : listing.listingUser.name}
          </p>
          {shouldDisplayDistance ? (
            <p className="mx-auto md:mx-0 text-xs text-slate-500">
              {listing.listingUser.city}, {listing.listingUser.region} -{" "}
              {formattedDistance} miles away
            </p>
          ) : (
            <p className="mx-auto md:mx-0  text-red-700 flex flex-row">
              <FaExclamationCircle className="mr-1 my-auto" />
              No Location Available
            </p>
          )}{" "}
          <div className="hidden md:flex md:flex-row gap-x-4">
            <p>Posted {new Date(listing.listedDate).toLocaleDateString()}</p>
            <p>
              Expires {new Date(listing.expirationDate).toLocaleDateString()}
            </p>
          </div>
          {totalOffers > 0 && (
            <p className="hidden md:block text-xs text-slate-500">
              {totalOffers} offer{totalOffers > 1 ? "s" : ""} submitted
            </p>
          )}
        </div>
      </div>
      <div className="p-4 shrink-0 mx-auto md:ml-auto md:mr-4 my-auto flex flex-col">
        <h2 className="mx-auto md:ml-auto text-2xl font-medium md:text-center">
          ${listing.startingPrice}
        </h2>
        <p className="mx-auto mt-2 text-xs md:text-gray-600 ml-auto md:flex flex-row mb-4">
          Starting Price
        </p>
        {/* If the current user has already offered, just take them to their current offer */}
        {/* TODO: Deep link directly to specific conversation */}
        {currentUserHasOffered && (
          <Link className="mx-auto" href={`/dashboard/inbox/`}>
            <Button className="ml-auto w-fit">View My Offer</Button>
          </Link>
        )}
        {!currentUserHasOffered && (
          <OfferButton
            listing={listing}
            currentUser={currentUser}
            buttonText="Make an Offer"
            buttonClassName="mx-auto md:ml-auto w-fit"
          />
        )}
      </div>
    </div>
  );
}
