import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Building2, 
    MapPin, 
    Eye, 
    Edit3, 
    Plus, 
    Search,
    Star,
    Users,
    IndianRupee} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

function Properties({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 6;

    // Mock data for demonstration
    const mockProperties = [
        {
            id: 1,
            name: "Stayease Harmonia",
            type: "PG/Hostel",
            location: "Virata Nagar, Bengaluru",
            rent: 12000,
            deposit: 50000,
            rooms: 25,
            occupancy: 85,
            rating: 4.5,
            amenities: ["WiFi", "AC", "Laundry", "Security"],
            image: "/api/placeholder/400/250",
            status: "Active",
            lastUpdated: "2 days ago"
        },
        {
            id: 2,
            name: "Stayease Aura",
            type: "Apartment",
            location: "Whitefield, Bengaluru",
            rent: 15000,
            deposit: 60000,
            rooms: 18,
            occupancy: 92,
            rating: 4.7,
            amenities: ["WiFi", "Gym", "Pool", "Parking"],
            image: "/api/placeholder/400/250",
            status: "Active",
            lastUpdated: "1 week ago"
        }
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setProperties(mockProperties);
            setIsLoading(false);
        }, 1000);
    }, []);

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "all" || property.type.toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        setCurrentPage(1);
    };

    const PropertyCard = ({ property }) => (
        <div className="group bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D4A017]/10 hover:-translate-y-1">
            {/* Property Image */}
            <div className="relative h-48 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#D4A017]/20 to-[#D4A017]/20 flex items-center justify-center">
                    <Building2 size={48} className="text-[#D4A017] opacity-50" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                    }`}>
                        {property.status}
                    </span>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-900 font-medium">{property.rating}</span>
                </div>

                {/* Occupancy Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                    <div className="flex items-center justify-between text-xs text-gray-900 mb-1">
                        <span>Occupancy</span>
                        <span>{property.occupancy}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                            className="bg-gradient-to-r from-[#D4A017] to-[#D4A017] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${property.occupancy}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D4A017] transition-colors duration-300">
                            {property.name}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin size={14} className="mr-1" />
                            {property.location}
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-[#D4A017]/20 text-[#D4A017] rounded-lg text-xs font-medium">
                        {property.type}
                    </span>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-600">
                        <Users size={16} className="mr-2 text-[#D4A017]" />
                        <span className="text-sm">{property.rooms} Rooms</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <IndianRupee size={16} className="mr-2 text-[#D4A017]" />
                        <span className="text-sm">₹{property.rent.toLocaleString()}</span>
                    </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-4">
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                        <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs border border-gray-200"
                        >
                            {amenity}
                        </span>
                    ))}
                    {property.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs border border-gray-200">
                            +{property.amenities.length - 3} more
                        </span>
                    )}
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Updated {property.lastUpdated}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate("/partners/partners-property-details")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#D4A017] hover:bg-[#B8860B] text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg group"
                    >
                        <Eye size={16} />
                        <span>View Details</span>
                    </button>
                    <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#D4A017] rounded-lg transition-all duration-300 border border-gray-200 hover:border-[#D4A017]/30">
                        <Edit3 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const LoadingCard = () => (
        <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-2xl overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-gray-800/50 to-gray-700/50 animate-pulse"></div>
            <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <MainLayout 
            title="My Properties"
            description="Manage and monitor your property listings"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Properties</p>
                            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                        </div>
                        <div className="p-3 bg-[#D4A017]/20 rounded-lg">
                            <Building2 size={20} className="text-[#D4A017]" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Avg. Occupancy</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {properties.length > 0 ? Math.round(properties.reduce((acc, prop) => acc + prop.occupancy, 0) / properties.length) : 0}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <Users size={20} className="text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{properties.reduce((acc, prop) => acc + (prop.rent * prop.rooms * (prop.occupancy / 100)), 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <IndianRupee size={20} className="text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search properties by name or location..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex space-x-2">
                    {["all", "PG", "Apartment"].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleFilterChange(type)}
                            className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                                filterType === type
                                    ? 'bg-[#D4A017] text-white shadow-lg'
                                    : 'bg-white/50 text-gray-600 border border-gray-200 hover:border-[#D4A017]/30 hover:text-[#D4A017]'
                            }`}
                        >
                            {type === "all" ? "All Types" : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <LoadingCard key={index} />
                    ))}
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || filterType !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "Get started by adding your first property"
                        }
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-[#D4A017] to-[#D4A017] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto">
                        <Plus size={18} />
                        <span>Add Your First Property</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                        {paginatedProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        currentPage === index + 1
                                            ? 'bg-[#D4A017] text-white shadow-lg'
                                            : 'bg-white/50 border border-gray-200 text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </MainLayout>
    );
}

export default Properties;