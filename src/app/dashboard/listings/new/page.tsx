"use client";
import Page from "@/components/Page";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addListing } from "@/actions/addListing";
import { format } from "date-fns";
import { FaCalendarAlt as CalendarIcon } from "react-icons/fa";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ListingData, ListingSchema } from "../../../../schemas/Listing";

export default function NewListingPage() {
  const form = useForm<ListingData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      title: "",
      listedDate: new Date(),
      // Expires by default in 2 weeks,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });
  const [isPending, startTransition] = useTransition();

  function onSubmit(data: ListingData) {
    startTransition(async () => {
      await addListing(data);
    });
  }

  return (
    <Page title="New Listing">
      <Form {...form}>
        <form
          className="w-full max-w-2xl flex flex-col gap-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-row gap-x-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full shrink-1">
                  <FormLabel>Listing Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your listing title..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startingPrice"
              render={({ field }) => (
                <FormItem className="w-fit shrink-0">
                  <FormLabel>Starting Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Desribe your listing" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-x-4">
            <FormField
              control={form.control}
              name="listedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    // Only allow image files
                    accept="image/*"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="ml-auto w-fit ">
            {isPending ? "Creating..." : "Submit Listing"}
          </Button>
        </form>
      </Form>
    </Page>
  );
}

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
});
