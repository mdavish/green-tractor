"use client";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeepPartial, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import updateProfile from "@/actions/addProfile";
import { ProfileSchema, type Profile } from "../../../schemas/Profile";
import { useToast } from "@/components/ui/use-toast";
import GeosearchBox from "@/components/GeosearchBox";
import { Dropdown } from "@/components/Dropdown";
import { states, StateSchema, convertDisplayToValue } from "@/schemas/State";

export function ProfileForm({
  name,
  profile,
  email,
  address,
}: DeepPartial<Profile & { email: string }>) {
  const { toast } = useToast();

  const form = useForm<Profile>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name,
      profile,
      address: {
        city: address?.city,
        region: address?.region,
        postalCode: address?.postalCode,
        coordinates: address?.coordinates,
        line1: address?.line1,
      },
    },
  });

  const [isPending, startTransition] = useTransition();

  function onSubmit(data: Profile) {
    startTransition(async () => {
      await updateProfile(data);
      toast({
        description: "Profile updated",
      });
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          className="w-full max-w-2xl flex flex-col gap-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormLabel>Email</FormLabel>
          <Input disabled value={email}></Input>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your profile..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <GeosearchBox
                    initialValue={address?.line1}
                    onSelect={(address) => {
                      form.setValue("address", address);
                      // But you also need to set the individual fields
                      form.setValue("address.city", address.city);
                      console.log("address.region", address.region);
                      form.setValue("address.region", address.region);
                      form.setValue("address.postalCode", address.postalCode);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-2">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.region"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Dropdown
                      label="State"
                      placeholder="State..."
                      onChange={field.onChange}
                      value={field.value}
                      options={states}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="ml-auto w-fit" type="submit">
            {isPending ? "Updating..." : "Update"}
          </Button>
        </form>
      </Form>
    </>
  );
}
