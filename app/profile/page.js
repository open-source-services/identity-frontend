'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Button, 
  Avatar,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  UserIcon, 
  KeyIcon, 
  TrashIcon, 
  ArrowRightStartOnRectangleIcon,
  ShieldCheckIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  LockClosedIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/ProtectedRoute';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpenChange } = useDisclosure();
  
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        
        // Check if backend has actual profile data
        if (response.data && response.data.data && response.data.message !== "Get profile endpoint - to be implemented") {
          const profileData = response.data.data;
          setProfile(profileData);
          setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || '',
          });
        } else {
          // Backend not implemented, use data from JWT token
          console.log('Backend profile endpoint not implemented, using JWT token data');
          const profileFromToken = {
            id: user?.id,
            email: user?.email,
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
          };
          
          setProfile(profileFromToken);
          setFormData({
            first_name: profileFromToken.first_name,
            last_name: profileFromToken.last_name,
            email: profileFromToken.email,
          });
        }
      } catch (err) {
        console.log('Profile API failed, using JWT token data as fallback');
        // Fallback to JWT token data
        const profileFromToken = {
          id: user?.id,
          email: user?.email,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
        };
        
        setProfile(profileFromToken);
        setFormData({
          first_name: profileFromToken.first_name,
          last_name: profileFromToken.last_name,
          email: profileFromToken.email,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      
      // Extract updated profile data from response
      const updatedProfile = response.data?.data || response.data;
      setProfile(updatedProfile);
      
      // Update form data with the new profile data
      setFormData({
        first_name: updatedProfile.first_name || '',
        last_name: updatedProfile.last_name || '',
        email: updatedProfile.email || '',
      });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      await userAPI.deleteAccount();
      await logout();
      router.push('/signin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-80 bg-slate-800 min-h-screen shadow-2xl fixed left-0 top-0 z-10">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Sharan Industries</h1>
              </div>
              
              <nav className="space-y-2">
                <div className="bg-emerald-600 rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <UserIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Profile</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span className="text-sm">Personal Information</span>
                  </div>
                  <div className="ml-8 mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer py-1">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span>Email Address</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer py-1">
                      <PhoneIcon className="h-3 w-3" />
                      <span>Mobile Numbers</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <KeyIcon className="h-5 w-5" />
                  <span className="font-medium">Security</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="font-medium">Multi-Factor Authentication</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <CogIcon className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  <span className="font-medium">Sessions</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <UserGroupIcon className="h-5 w-5" />
                  <span className="font-medium">Groups</span>
                </div>
                
                <div className="px-4 py-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-slate-300 hover:text-white">
                  <LockClosedIcon className="h-5 w-5" />
                  <span className="font-medium">Privacy</span>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 ml-80 min-h-screen overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl space-y-8">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <Button
                  color="danger"
                  variant="light"
                  startContent={<ArrowRightStartOnRectangleIcon className="h-4 w-4" />}
                  onPress={handleLogout}
                  className="font-medium"
                >
                  Sign Out
                </Button>
              </div>

              {/* Profile Header Card */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardBody className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Avatar
                        size="xl"
                        name={profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : profile?.email || 'U'
                        }
                        className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold shadow-xl"
                      />
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}`
                            : 'User'
                          }
                        </h2>
                        <p className="text-gray-600 font-medium">{profile?.email}</p>
                        <div className="flex items-center gap-3">
                          <Chip 
                            size="sm" 
                            color={profile?.is_active ? "success" : "danger"} 
                            variant="flat"
                            className="font-medium"
                          >
                            {profile?.is_active ? "Active" : "Inactive"}
                          </Chip>
                          <Chip 
                            size="sm" 
                            color={profile?.is_email_verified ? "primary" : "warning"} 
                            variant="flat"
                            className="font-medium"
                          >
                            {profile?.is_email_verified ? "Verified" : "Unverified"}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={() => setIsEditing(true)}
                        className="font-medium px-6"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Status Messages */}
              {error && (
                <Card className="border-l-4 border-l-red-500 bg-red-50 shadow-sm">
                  <CardBody className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </CardBody>
                </Card>
              )}
              
              {success && (
                <Card className="border-l-4 border-l-green-500 bg-green-50 shadow-sm">
                  <CardBody className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p className="text-sm font-medium text-green-700">{success}</p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Profile Information Card */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardBody className="p-8">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Full Name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          isRequired
                          variant="bordered"
                          className="text-base"
                        />
                        <Input
                          label="Display Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          isRequired
                          variant="bordered"
                          className="text-base"
                        />
                      </div>
                      
                      <Input
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        isDisabled
                        variant="bordered"
                        description="Email cannot be changed"
                        className="text-base"
                      />
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          color="primary"
                          isLoading={updating}
                          disabled={updating}
                          className="font-medium px-8"
                        >
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="bordered"
                          onPress={() => {
                            setIsEditing(false);
                            setFormData({
                              first_name: profile.first_name || '',
                              last_name: profile.last_name || '',
                              email: profile.email || '',
                            });
                          }}
                          className="font-medium"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8">
                      {/* Personal Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <p className="text-lg text-gray-900">
                            {profile?.first_name && profile?.last_name 
                              ? `${profile.first_name} ${profile.last_name}`
                              : 'Sharan'
                            }
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Display Name</label>
                          <p className="text-lg text-gray-900">
                            {profile?.first_name || 'Sharan'}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Gender</label>
                          <p className="text-lg text-gray-900">I'd prefer not to say</p>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Country/Region</label>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇮🇳</span>
                            <span className="text-lg text-gray-900">India</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">State</label>
                          <p className="text-lg text-gray-900">Tamil Nadu</p>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Language</label>
                          <p className="text-lg text-gray-900">English</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Time zone</label>
                        <p className="text-lg text-gray-900">(GMT +05:30) India Standard Time ( Asia/Kolkata )</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Email Addresses Section */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">My Email Addresses</h3>
                </CardHeader>
                <CardBody className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    View and manage the email addresses associated with your account. They can be used to sign in and to reset password if you ever forget it.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{profile?.email}</p>
                          <p className="text-sm text-gray-500">6 years ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Chip color="success" variant="flat" size="sm">✓</Chip>
                        <div className="w-6 h-6 text-gray-400">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Account Access Information */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">Account Access</h3>
                </CardHeader>
                <CardBody className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-3">Roles</label>
                      {user?.roles?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, index) => (
                            <Chip 
                              key={index} 
                              color="primary" 
                              variant="flat" 
                              size="md"
                              className="font-medium capitalize px-3 py-1"
                            >
                              {role}
                            </Chip>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">No roles assigned</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-3">Permissions</label>
                      {user?.permissions?.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {user.permissions.map((permission, index) => (
                              <div 
                                key={index}
                                className="px-3 py-2 text-xs font-mono bg-gray-100 text-gray-700 rounded border"
                              >
                                {permission}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">No permissions assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-white shadow-sm border border-red-200">
                <CardHeader className="border-b border-red-200 bg-red-50">
                  <h3 className="text-xl font-semibold text-red-800">Danger Zone</h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Once you delete your account, there is no going back. This will permanently delete your profile, 
                        all associated data, and revoke access to all services.
                      </p>
                      <Button
                        color="danger"
                        variant="solid"
                        startContent={<TrashIcon className="h-4 w-4" />}
                        onPress={() => onOpenChange(true)}
                        className="font-medium"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent className="border-2 border-red-200">
              {(onClose) => (
                <>
                  <ModalHeader className="flex items-center gap-3 pb-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-large">
                    <div className="p-2 bg-red-200 rounded-full">
                      <TrashIcon className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700">⚠️ Delete Account</h3>
                      <p className="text-xs text-red-600 font-normal">This action is permanent</p>
                    </div>
                  </ModalHeader>
                  <ModalBody className="py-6">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        Are you absolutely sure you want to delete your account? This will permanently remove:
                      </p>
                      <div className="bg-red-50 p-3 rounded-lg border-l-4 border-l-red-500">
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Your profile and personal information</li>
                          <li>• All associated data and settings</li>
                          <li>• Access to all services and features</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          💡 This action cannot be undone and data cannot be recovered.
                        </p>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter className="gap-3">
                    <Button 
                      variant="light" 
                      onPress={onClose}
                      className="font-medium"
                    >
                      Keep Account
                    </Button>
                    <Button 
                      color="danger" 
                      variant="solid"
                      startContent={<TrashIcon className="h-4 w-4" />}
                      onPress={() => {
                        onClose();
                        handleDeleteAccount();
                      }}
                      className="font-semibold"
                    >
                      Delete Forever
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  );
}