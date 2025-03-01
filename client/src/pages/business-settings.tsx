import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSettingsSchema } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Upload, User, Mail, Phone, MapPin, ImageIcon } from "lucide-react";

export default function BusinessSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["/api/business-settings/1"],
  });

  const form = useForm({
    resolver: zodResolver(insertBusinessSettingsSchema),
    defaultValues: {
      userId: 1,
      businessName: settings?.businessName || "",
      address: settings?.address || "",
      city: settings?.city || "",
      state: settings?.state || "",
      zipCode: settings?.zipCode || "",
      phone: settings?.phone || "",
      email: settings?.email || "",
      logo: settings?.logo || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/business-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-settings/1"] });
      toast({
        title: "Settings updated",
        description: "Your business information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload logo");

      const { url } = await response.json();
      form.setValue("logo", url);

      toast({
        title: "Logo uploaded",
        description: "Your business logo has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Business Settings</h1>
        </div>

        <Card className="max-w-2xl mx-auto p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <Building2 className="h-4 w-4 text-primary" />
                        Business Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="Enter your business name" />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-primary" />
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="Enter your business address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-primary" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-primary" />
                          State
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-primary" />
                        ZIP Code
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white hover:border-primary/50 transition-colors" placeholder="ZIP Code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4 text-primary" />
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white hover:border-primary/50 transition-colors" type="tel" placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white hover:border-primary/50 transition-colors" type="email" placeholder="Business email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        Logo
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          {field.value && (
                            <img
                              src={field.value}
                              alt="Business logo"
                              className="h-16 w-16 object-contain rounded-lg border border-gray-200 bg-white p-2"
                            />
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="bg-white hover:border-primary/50 transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Recommended: Square image, at least 200x200px
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-[#22c55e] hover:from-primary/90 hover:to-[#22c55e]/90 transition-all duration-200"
                disabled={mutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}