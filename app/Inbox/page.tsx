"use client";

import { useState } from "react";
import { Users, Mail, Clock, Filter, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

import HomeSidebar from "@/components/homeSidebar"
import { Separator } from "@/components/ui/separator";

const dummyData = {
  invites: [
    { id: 1, from: "Raj", project: "AI Workspace", time: "2h ago" },
    { id: 2, from: "Mira", project: "DSA Practice", time: "1d ago" },
  ],
  requests: [
    { id: 3, user: "Anish", project: "Finance Manager", time: "5m ago" },
  ],
  activity: [
    { id: 4, message: "You accepted Mira’s invite", time: "3d ago" },
  ],
};

export default function InvitesPage() {
  const [filter, setFilter] = useState<"invites" | "requests" | "activity">("invites");

  const renderList = () => {
    switch (filter) {
      case "invites":
        return dummyData.invites.map((i) => (
          <div key={i.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 w-[80%]">
            <div>
              <p className="font-medium">{i.from} invited you to join <span className="font-semibold">{i.project}</span></p>
              <span className="text-xs text-muted-foreground">{i.time}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="default"><Check className="w-4 h-4 mr-1" /> Accept</Button>
              <Button size="sm" variant="destructive"><X className="w-4 h-4 mr-1" /> Decline</Button>
            </div>
          </div>
        ));
      case "requests":
        return dummyData.requests.map((r) => (
          <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
            <div>
              <p className="font-medium">{r.user} requested to join <span className="font-semibold">{r.project}</span></p>
              <span className="text-xs text-muted-foreground">{r.time}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="default"><Check className="w-4 h-4 mr-1" /> Approve</Button>
              <Button size="sm" variant="destructive"><X className="w-4 h-4 mr-1" /> Reject</Button>
            </div>
          </div>
        ));
      case "activity":
        return dummyData.activity.map((a) => (
          <div key={a.id} className="p-3 border rounded-lg hover:bg-muted/50">
            <p>{a.message}</p>
            <span className="text-xs text-muted-foreground">{a.time}</span>
          </div>
        ));
    }
  };

  return (
    <>
        <Header/>
      <div className="flex w-screen">
        <HomeSidebar/>
        <div className="flex flex-col gap-3 ml-4 w-screen">
            <div className="flex gap-3 mt-6">
                <Button
            variant={filter === "invites" ? "default" : "outline"}
            onClick={() => setFilter("invites")}
          >
            <Mail className="w-4 h-4 mr-1" /> Invitations
          </Button>
          <Button
            variant={filter === "requests" ? "default" : "outline"}
            onClick={() => setFilter("requests")}
          >
            <Users className="w-4 h-4 mr-1" /> Requests
          </Button>
          <Button
            variant={filter === "activity" ? "default" : "outline"}
            onClick={() => setFilter("activity")}
          >
            <Clock className="w-4 h-4 mr-1" /> Activity
          </Button>
            </div>
            <Separator className="my-4 bg-gray-400 "/>
          
          <div className="flex flex-col items-center justify-center space-y-3 max-w-screen-xl">{renderList()}</div>
        </div>
      </div>

      {/* Content */}
      
    </>
  );
}
