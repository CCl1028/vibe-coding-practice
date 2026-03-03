"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sword } from "lucide-react"

export default function LoginPage() {
  const handleDemoLogin = async () => {
    await signIn("credentials", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Sword className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Questify
          </CardTitle>
          <CardDescription className="text-lg">
            把现实任务，变成角色成长
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleDemoLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              size="lg"
            >
              开始冒险 (Demo 模式)
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Phase 1 - 核心框架展示版本</p>
              <p className="mt-2 text-xs">
                后续版本将支持 GitHub / Google 登录
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
