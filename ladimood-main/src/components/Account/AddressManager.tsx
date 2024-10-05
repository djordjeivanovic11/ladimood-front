"use client";
import React, { useEffect, useState } from 'react';
import { getAddress, setAddress, deleteAddress } from '@/api/account/axios';
import { Address } from '@/app/types/types';

interface AddressManagerProps {
    onAddressSaved?: (address: Address) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSaved }) => {
    const [address, setAddressState] = useState<Address | null>(null); // State to store the fetched address
    const [form, setForm] = useState({
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
    });

    // Fetch the address when the component mounts
    useEffect(() => {
        getAddress()
            .then((data) => {
                setAddressState(data); // Set the fetched address to the state
                setForm({
                    street_address: data.street_address || '',
                    city: data.city || '',
                    state: data.state || '',
                    postal_code: data.postal_code || '',
                    country: data.country || ''
                }); // Populate the form with the fetched address data
            })
            .catch(() => setAddressState(null)); // If no address, set it to null
    }, []);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle form submission to set or update the address
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedAddress = await setAddress(form); // Send form data to setAddress API
            setAddressState(updatedAddress); // Update the address state

            if (onAddressSaved) {
                onAddressSaved(updatedAddress); // Trigger callback when address is saved
            }
        } catch (error) {
            console.error('Failed to set address', error); // Handle errors here
        }
    };

    // Handle address deletion
    const handleDelete = async () => {
        try {
            await deleteAddress(); // Call the deleteAddress API
            setAddressState(null); // Clear the address state after deletion
            setForm({
                street_address: '',
                city: '',
                state: '',
                postal_code: '',
                country: ''
            }); // Reset the form
        } catch (error) {
            console.error('Failed to delete address', error); // Handle errors here
        }
    };

    // Handle form reset to clear fields
    const handleReset = () => {
        setForm({
            street_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
        });
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-8 border border-[#0097B2]">
            {address ? (
                <div className="space-y-4">
                    <p className="text-lg text-gray-900">{`${address.street_address}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`}</p>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleDelete} 
                            className="bg-[#0097B2] text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
                        >
                            Delete Address
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700">Street Address:</label>
                        <input 
                            name="street_address" 
                            value={form.street_address} 
                            onChange={handleChange} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">City:</label>
                        <input 
                            name="city" 
                            value={form.city} 
                            onChange={handleChange} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">State:</label>
                        <input 
                            name="state" 
                            value={form.state} 
                            onChange={handleChange} 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">Postal Code:</label>
                        <input 
                            name="postal_code" 
                            value={form.postal_code} 
                            onChange={handleChange} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">Country:</label>
                        <input 
                            name="country" 
                            value={form.country} 
                            onChange={handleChange} 
                            required 
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] outline-none text-gray-900"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-[#0097B2] text-white py-2 rounded-lg shadow hover:bg-[#007A90] transition"
                    >
                        {address ? 'Update Address' : 'Add Address'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddressManager;
