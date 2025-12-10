import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ExternalLink, Mail, MapPin, Globe } from 'lucide-react'

interface DeveloperProfileData {
  name: string
  profilePicture: string
  company: string
  companyWebsite: string
  email?: string
  location?: string
  bio?: string
}

export default function DeveloperProfile() {
  const [profile, setProfile] = useState<DeveloperProfileData>({
    name: 'Developer Name',
    profilePicture: '',
    company: 'ntes',
    companyWebsite: 'https://ntes-main-website.onrender.com/',
    bio: 'Full-stack developer with expertise in modern web technologies'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<DeveloperProfileData>(profile)

  const handleSaveProfile = () => {
    setProfile(editData)
    setIsEditing(false)
    localStorage.setItem('developerProfile', JSON.stringify(editData))
  }

  const handleInputChange = (field: keyof DeveloperProfileData, value: string) => {
    setEditData({
      ...editData,
      [field]: value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ump-blue-50 via-white to-ump-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-ump-blue/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ump-navy to-ump-blue text-white rounded-t-lg">
            <CardTitle className="text-3xl">Developer Profile</CardTitle>
            <CardDescription className="text-white/80">
              Manage your professional profile and portfolio information
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {!isEditing ? (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-ump-blue shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-ump-orange to-ump-red flex items-center justify-center border-4 border-ump-blue shadow-lg">
                      <span className="text-4xl text-white font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="border-b border-ump-blue/10 pb-4">
                    <h2 className="text-2xl font-bold text-ump-navy">{profile.name}</h2>
                    <p className="text-lg text-ump-orange font-semibold">{profile.company}</p>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-ump-navy mb-2">About</h3>
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.email && (
                      <div className="flex items-center gap-3 p-3 bg-ump-blue/5 rounded-lg">
                        <Mail className="w-5 h-5 text-ump-blue" />
                        <div>
                          <p className="text-xs text-ump-gray font-semibold">Email</p>
                          <p className="text-sm text-ump-navy">{profile.email}</p>
                        </div>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-3 p-3 bg-ump-blue/5 rounded-lg">
                        <MapPin className="w-5 h-5 text-ump-blue" />
                        <div>
                          <p className="text-xs text-ump-gray font-semibold">Location</p>
                          <p className="text-sm text-ump-navy">{profile.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Website Link */}
                  <div className="pt-4 border-t border-ump-blue/10">
                    <a
                      href={profile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ump-blue to-ump-navy text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                    >
                      <Globe className="w-5 h-5" />
                      Visit {profile.company.toUpperCase()} Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  onClick={() => {
                    setIsEditing(true)
                    setEditData(profile)
                  }}
                  className="w-full bg-ump-orange hover:bg-ump-orange/90 text-white font-semibold py-3"
                >
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Edit Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={editData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter company name"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={editData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      placeholder="https://example.com"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Profile Picture URL</Label>
                    <Input
                      id="profilePicture"
                      type="text"
                      value={editData.profilePicture}
                      onChange={(e) => handleInputChange('profilePicture', e.target.value)}
                      placeholder="Enter image URL or path"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                    {editData.profilePicture && (
                      <img
                        src={editData.profilePicture}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover mt-2 border-2 border-ump-blue"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={editData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter location"
                      className="border-ump-blue/20 focus:border-ump-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <textarea
                      id="bio"
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Enter a short bio about yourself"
                      className="w-full px-3 py-2 border border-ump-blue/20 rounded-lg focus:border-ump-blue focus:outline-none"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-ump-green hover:bg-ump-green/90 text-white font-semibold py-3"
                  >
                    Save Profile
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 border-ump-blue/20 text-ump-navy font-semibold py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
