import { ArrowLeft, Mail, User2, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const getInitials = (name: string = '') => {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-primary/10 to-primary/30 rounded-t-lg" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={user?.profileImage} alt={user?.name}  className='object-cover'/>
              <AvatarFallback className="text-2xl bg-primary/20">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">{user?.name}</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="grid gap-6 max-w-xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User2 className="w-4 h-4" />
                <span>Gender</span>
              </div>
              <p className="text-foreground pl-6">
                {user?.gender || 'Not specified'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Purpose</span>
              </div>
              <p className="text-foreground pl-6">
                {user?.purpose || 'Not specified'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User2 className="w-4 h-4" />
                <span>About</span>
              </div>
              <p className="text-foreground pl-6 whitespace-pre-wrap">
                {user?.about || 'No description provided'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="gap-2 w-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

