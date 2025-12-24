"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createGrievance, createOdc, getVehicleTypes } from "@/apicalls/citizen"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FormData {
    mobile: string
    email: string
    address: string
    vehicle_type: string
}

export function SubmissionForm({ setRefetch }: { setRefetch: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        mobile: "",
        email: "",
        address: "",
        vehicle_type: ""
    })
    const [vehicleTypes, setVehicleTypes] = useState<any>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await createOdc(formData)
            setRefetch(((prev: any) => !prev))
            // Reset form and close dialog
            setFormData({ mobile: "", email: "", address: "", vehicle_type: "" })
            setIsOpen(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Error submitting form. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchVehicleTypes = async () => {
            try {
                const data = await getVehicleTypes()
                setVehicleTypes(data.data?.data)
            } catch (error) {
                console.error("Error fetching vehicle types:", error)
            }
        }
        fetchVehicleTypes()
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg">Create</Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Grievance</DialogTitle>
                    <DialogDescription>Please fill in your details below</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <Select
                        value={formData.vehicle_type}
                        onValueChange={(v) =>
                            handleInputChange({
                                target: { name: "vehicle_type", value: v },
                            } as React.ChangeEvent<HTMLInputElement>)
                        }
                    >
                        <SelectTrigger className="min-w-56">
                            <SelectValue
                                placeholder={'Select Vehicle Type'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {vehicleTypes.map((u: any) => (
                                <SelectItem key={u.id} value={String(u.id)}>
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            required
                            pattern="[0-9]+"
                            className="w-full"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full"
                        />
                    </div>

                    {/* Remark Field */}
                    <div className="space-y-2">
                        <Label htmlFor="remark">Address</Label>
                        <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    )
}
