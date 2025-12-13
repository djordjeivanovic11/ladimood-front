"use client";
import React, { useEffect, useState } from "react";
import { getAddress, setAddress, deleteAddress } from "@/api/account/axios";
import { Address } from "@/app/types/types";

interface AddressManagerProps {
  onAddressSaved?: (address: Address) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSaved }) => {
  const [address, setAddressState] = useState<Address | null>(null);
  const [form, setForm] = useState({
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    getAddress()
      .then((data) => {
        setAddressState(data);
        setForm({
          street_address: data.street_address || "",
          city: data.city || "",
          state: data.state || "",
          postal_code: data.postal_code || "",
          country: data.country || "",
        });
      })
      .catch(() => setAddressState(null));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedAddress = await setAddress(form);
      setAddressState(updatedAddress);

      if (onAddressSaved) {
        onAddressSaved(updatedAddress);
      }
    } catch (error) {
      console.error("Failed to set address", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAddress();
      setAddressState(null);
      setForm({
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
    } catch (error) {
      console.error("Failed to delete address", error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-xl p-8 border border-gray-300 max-w-2xl mx-auto mt-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {address ? "Manage Your Address" : "Add a New Address"}
          </h2>
          <p className="text-sm text-gray-500">
            {address
              ? "Edit or delete your saved address below."
              : "Fill in the form to save your address."}
          </p>
        </div>

        {/* Address Display or Form */}
        {address ? (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 space-y-4">
            <p className="text-lg font-medium text-gray-700">
              {`${address.street_address}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Delete Address</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: "street_address", label: "Street Address" },
              { name: "city", label: "City" },
              { name: "state", label: "State" },
              { name: "postal_code", label: "Postal Code" },
              { name: "country", label: "Country" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor={name}
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={label}
                  required
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097B2] focus:outline-none text-gray-800 shadow-sm"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-[#0097B2] text-white py-3 rounded-lg shadow hover:bg-[#007A90] transition-all duration-300"
            >
              {address ? "Update Address" : "Save Address"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressManager;
