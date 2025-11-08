import { Languages, CheckCircle, Star, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Provider, ProviderSearchResult } from '@/types'

interface ProviderCardProps {
  provider: Provider | ProviderSearchResult
  onSelect?: (providerId: string) => void
  selected?: boolean
  showSelectButton?: boolean
}

export default function ProviderCard({
  provider,
  onSelect,
  selected = false,
  showSelectButton = true,
}: ProviderCardProps) {
  const initials = `${provider.firstName.charAt(0)}${provider.lastName.charAt(0)}`

  // Handle both Provider and ProviderSearchResult types
  const photoUrl =
    'photoUrl' in provider ? provider.photoUrl : 'avatar' in provider ? provider.avatar : undefined
  const npi =
    'npi' in provider ? provider.npi : 'npiNumber' in provider ? provider.npiNumber : undefined
  const title = 'title' in provider ? provider.title : undefined
  const rating = 'rating' in provider ? provider.rating : undefined
  const reviewCount = 'reviewCount' in provider ? provider.reviewCount : undefined
  const location = 'location' in provider ? provider.location : undefined

  return (
    <Card className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={photoUrl} alt={`${title || 'Dr.'} ${provider.lastName}`} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          {/* Provider Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-neutral-blue-gray">
                  {title || 'Dr.'} {provider.firstName} {provider.lastName}
                </h3>
                {provider.specialty && (
                  <p className="text-sm text-neutral-blue-gray/70">{provider.specialty}</p>
                )}
                {rating !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                    {reviewCount !== undefined && (
                      <span className="text-sm text-neutral-blue-gray/70">
                        ({reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
              {provider.acceptingNewPatients && (
                <Badge variant="success" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepting Patients
                </Badge>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-1 text-sm text-neutral-blue-gray/80">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {location.city}, {location.state} {location.zipCode}
                  </span>
                </div>
              )}
              {provider.languages && provider.languages.length > 0 && (
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span>{provider.languages.join(', ')}</span>
                </div>
              )}
              {npi && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">NPI:</span>
                  <span>{npi}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {provider.bio && (
              <p className="text-sm text-neutral-blue-gray/70 line-clamp-2 pt-1">{provider.bio}</p>
            )}

            {/* Select Button */}
            {showSelectButton && onSelect && (
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => onSelect(provider.id)}
                  variant={selected ? 'default' : 'outline'}
                >
                  {selected ? 'Selected' : 'Select Provider'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
