"use client";

import { useState } from "react";
import { Users, Mail, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import HomeSidebar from "@/components/homeSidebar";
import { Separator } from "@/components/ui/separator";
import { useInbox } from "@/features/invitations/api/useInbox";
import { useUpdateInvitation } from "@/features/invitations/api/useUpdateInvitation";
import { useUpdateJoinRequest } from "@/features/join-requests/api/useUpdateJoinRequest";
import { useCreateJoinRequest } from "@/features/join-requests/api/useCreateJoinRequest";
import { Input } from "@/components/ui/input";

type Filter = "invites" | "requests" | "activity";

export default function InvitesPage() {
  const [filter, setFilter] = useState<Filter>("invites");
  const { data, isLoading } = useInbox();
  const updateInvitation = useUpdateInvitation();
  const updateJoinRequest = useUpdateJoinRequest();
  const createJoinRequest = useCreateJoinRequest();
  const [projectId, setProjectId] = useState("");

  const renderList = () => {
    if (isLoading || !data) {
      return <p className="text-sm text-muted-foreground">Loading...</p>;
    }

    switch (filter) {
      case "invites":
        if (!data.invites.length) {
          return (
            <p className="text-sm text-muted-foreground">
              No invitations yet.
            </p>
          );
        }
        return data.invites.map((i) => (
          <div
            key={i.id}
            className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 w-[80%]"
          >
            <div>
              <p className="font-medium">
                {i.fromName} invited you to join{" "}
                <span className="font-semibold">{i.projectName}</span>
              </p>
              <span className="text-xs text-muted-foreground">
                {new Date(i.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                disabled={updateInvitation.isPending}
                onClick={() =>
                  updateInvitation.mutate({
                    invitationId: i.id,
                    action: "accept",
                  })
                }
              >
                <Check className="w-4 h-4 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={updateInvitation.isPending}
                onClick={() =>
                  updateInvitation.mutate({
                    invitationId: i.id,
                    action: "decline",
                  })
                }
              >
                <X className="w-4 h-4 mr-1" /> Decline
              </Button>
            </div>
          </div>
        ));
      case "requests":
        if (!data.requestsReceived.length && !data.requestsSent.length) {
          return (
            <p className="text-sm text-muted-foreground">
              No join requests yet.
            </p>
          );
        }

        return (
          <div className="flex flex-col gap-4 w-[80%]">
            {data.requestsReceived.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Received
                </h3>
                {data.requestsReceived.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {r.userName} requested to join{" "}
                        <span className="font-semibold">{r.projectName}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={updateJoinRequest.isPending}
                        onClick={() =>
                          updateJoinRequest.mutate({
                            requestId: r.id,
                            action: "accept",
                          })
                        }
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={updateJoinRequest.isPending}
                        onClick={() =>
                          updateJoinRequest.mutate({
                            requestId: r.id,
                            action: "decline",
                          })
                        }
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.requestsSent.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Sent
                </h3>
                {data.requestsSent.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        You requested to join{" "}
                        <span className="font-semibold">{r.projectName}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()} ·{" "}
                        <span className="italic">{r.status}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "activity":
        if (!data.activity.length) {
          return (
            <p className="text-sm text-muted-foreground">
              No recent activity.
            </p>
          );
        }
        return data.activity.map((a) => (
          <div
            key={a.id}
            className="p-3 border rounded-lg hover:bg-muted/50 w-[80%]"
          >
            <p>{a.message}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(a.time).toLocaleString()}
            </span>
          </div>
        ));
    }
  };

  return (
    <>
      <Header />
      <div className="flex w-screen">
        <HomeSidebar />
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
          <Separator className="my-4 bg-gray-400 " />

          <div className="flex flex-col items-center justify-center space-y-3 max-w-screen-xl">
            {filter === "requests" && (
              <div className="w-[80%] flex items-center gap-2 mb-4">
                <Input
                  placeholder="Enter project ID to request access"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  disabled={!projectId || createJoinRequest.isPending}
                  onClick={() =>
                    createJoinRequest.mutate({ projectId }, { onSuccess: () => setProjectId("") })
                  }
                >
                  Send request
                </Button>
              </div>
            )}

            {renderList()}
          </div>
        </div>
      </div>
    </>
  );
}


