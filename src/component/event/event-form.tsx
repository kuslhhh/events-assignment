'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/component/ui/input';
import { Textarea } from '@/component/ui/textarea';
import { Select } from '@/component/ui/select';
import { Button } from '@/component/ui/button';
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-event';
import { EVENT_CATEGORIES } from '@/lib/constants';
import { formatDateTimeLocal, dateTimeLocalToISO } from '@/lib/form-utils';
import type { Event } from '@/db/schema';
import type { CreateEventInput } from '@/lib/validations/event.validation';

type EventFormProps = {
  event?: Event;
  mode: 'create' | 'edit';
};

type FormData = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  maxAttendees: string;
  imageUrl: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [formData, setFormData] = useState<FormData>({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate ? formatDateTimeLocal(event.startDate) : '',
    endDate: event?.endDate ? formatDateTimeLocal(event.endDate) : '',
    category: event?.category || '',
    maxAttendees: event?.maxAttendees?.toString() || '',
    imageUrl: event?.imageUrl || '',
    isActive: event?.isActive ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.maxAttendees && parseInt(formData.maxAttendees) < 1) {
      newErrors.maxAttendees = 'Max attendees must be at least 1';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const eventData: CreateEventInput = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      startDate: dateTimeLocalToISO(formData.startDate),
      endDate: dateTimeLocalToISO(formData.endDate),
      category: formData.category,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
      imageUrl: formData.imageUrl.trim() || null,
      isActive: formData.isActive,
    };

    try {
      if (mode === 'create') {
        await createEvent.mutateAsync(eventData);
        router.push('/');
      } else if (event) {
        await updateEvent.mutateAsync({
          id: event.id,
          data: eventData,
        });
        router.push(`/events/${event.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error is already handled by React Query
    }
  };

  const isLoading = createEvent.isPending || updateEvent.isPending;
  const error = createEvent.error || updateEvent.error;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <p className="text-sm font-semibold">Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Describe your event"
            rows={4}
            required
          />
        </div>

        {/* Location */}
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          placeholder="Event location"
          required
        />

        {/* Category */}
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          options={EVENT_CATEGORIES}
          required
        />

        {/* Start Date */}
        <Input
          label="Start Date & Time"
          name="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />

        {/* End Date */}
        <Input
          label="End Date & Time"
          name="endDate"
          type="datetime-local"
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
          required
        />

        {/* Max Attendees */}
        <Input
          label="Max Attendees (Optional)"
          name="maxAttendees"
          type="number"
          value={formData.maxAttendees}
          onChange={handleChange}
          error={errors.maxAttendees}
          placeholder="No limit"
          min="1"
        />

        {/* Image URL */}
        <Input
          label="Image URL (Optional)"
          name="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={handleChange}
          error={errors.imageUrl}
          placeholder="https://example.com/image.jpg"
        />

        {/* Active Status */}
        <div className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Event is active
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Create Event' : 'Update Event'}
        </Button>
      </div>
    </motion.form>
  );
}