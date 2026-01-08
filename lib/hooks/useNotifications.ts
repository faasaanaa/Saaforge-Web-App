'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCollection } from './useFirestore';
import {
  UserNotifications,
  JoinRequest,
  ProjectIdea,
  Order,
  ProjectFeedback,
  Task,
  Project,
  TeamProfile,
  SiteContent,
  AuditLog
} from '@/lib/types';
import { Timestamp, onSnapshot, doc as firestoreDoc } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

type NotificationSection = 
  | 'requests' 
  | 'applications' 
  | 'ideas' 
  | 'orders' 
  | 'feedback' 
  | 'projects' 
  | 'tasks' 
  | 'team' 
  | 'content' 
  | 'audit';

export function useNotifications() {
  const { user } = useAuth();
  const [notificationCounts, setNotificationCounts] = useState<Record<NotificationSection, number>>({
    requests: 0,
    applications: 0,
    ideas: 0,
    orders: 0,
    feedback: 0,
    projects: 0,
    tasks: 0,
    team: 0,
    content: 0,
    audit: 0,
  });
    const [currentNotification, setCurrentNotification] = useState<UserNotifications | null>(null);

    // Listen to user's notification document directly
    useEffect(() => {
      if (!user?.uid || !db) return;

      const notificationRef = firestoreDoc(db, 'userNotifications', user.uid);
      const unsubscribe = onSnapshot(
        notificationRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setCurrentNotification({ id: snapshot.id, ...snapshot.data() } as UserNotifications);
          } else {
            setCurrentNotification(null);
          }
        },
        (error) => {
          setCurrentNotification(null);
        }
      );

      return () => unsubscribe();
    }, [user?.uid]);

  // Get all relevant collections for owner
  const { data: joinRequests } = useCollection<JoinRequest>('joinRequests');
  const { data: projectIdeas } = useCollection<ProjectIdea>('projectIdeas');
  const { data: orders } = useCollection<Order>('orders');
  const { data: feedback } = useCollection<ProjectFeedback>('projectFeedback');
  const { data: tasks } = useCollection<Task>('tasks');
  const { data: projects } = useCollection<Project>('projects');
  const { data: teamProfiles } = useCollection<TeamProfile>('teamProfiles');
  const { data: content } = useCollection<SiteContent>('siteContent');
  const { data: auditLogs } = useCollection<AuditLog>('auditLogs');

  useEffect(() => {
    if (!user) return;

    const counts: Record<NotificationSection, number> = {
      requests: 0,
      applications: 0,
      ideas: 0,
      orders: 0,
      feedback: 0,
      projects: 0,
      tasks: 0,
      team: 0,
      content: 0,
      audit: 0,
    };

    const lastViewed = currentNotification?.lastViewed || {};

    // Count new join requests
    if (joinRequests) {
      const newCount = joinRequests.filter(req => {
        const lastViewedTime = lastViewed.requests;
        if (!req.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || req.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.requests = newCount;
    }

    // Count new project ideas
    if (projectIdeas) {
      const newCount = projectIdeas.filter(idea => {
        const lastViewedTime = lastViewed.ideas;
        if (!idea.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || idea.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.ideas = newCount;
    }

    // Count new orders
    if (orders) {
      const newCount = orders.filter(order => {
        const lastViewedTime = lastViewed.orders;
        if (!order.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || order.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.orders = newCount;
    }

    // Count new feedback
    if (feedback) {
      const newCount = feedback.filter(fb => {
        const lastViewedTime = lastViewed.feedback;
        if (!fb.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || fb.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.feedback = newCount;
    }

    // Count new tasks (for team members)
    if (tasks && user.role === 'team') {
      const myTasks = tasks.filter(task => task.assignedTo === user.uid);
      const newCount = myTasks.filter(task => {
        const lastViewedTime = lastViewed.tasks;
        if (!task.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || task.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.tasks = newCount;
    }

    // Count new projects (for team members)
    if (projects && user.role === 'team') {
      const myProjects = projects.filter(project => 
        project.assignedMembers?.includes(user.uid)
      );
      const newCount = myProjects.filter(project => {
        const lastViewedTime = lastViewed.projects;
        if (!project.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || project.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.projects = newCount;
    }

    // Count new team members (for owner)
    if (teamProfiles && user.role === 'owner') {
      const newCount = teamProfiles.filter(profile => {
        const lastViewedTime = lastViewed.team;
        if (!profile.createdAt) return true; // Show if no timestamp
        return !lastViewedTime || profile.createdAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.team = newCount;
    }

    // Count updated content (for owner)
    if (content && user.role === 'owner') {
      const newCount = content.filter(item => {
        const lastViewedTime = lastViewed.content;
        if (!item.updatedAt) return true; // Show if no timestamp
        return !lastViewedTime || item.updatedAt.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.content = newCount;
    }

    // Count new audit logs (for owner)
    if (auditLogs && user.role === 'owner') {
      const newCount = auditLogs.filter(log => {
        const lastViewedTime = lastViewed.audit;
        if (!log.timestamp) return true; // Show if no timestamp
        return !lastViewedTime || log.timestamp.toMillis() > lastViewedTime.toMillis();
      }).length;
      counts.audit = newCount;
    }

    setNotificationCounts(counts);
  }, [
    user,
    currentNotification,
    joinRequests,
    projectIdeas,
    orders,
    feedback,
    tasks,
    projects,
    teamProfiles,
    content,
    auditLogs,
  ]);

  const markAsViewed = useCallback(async (section: NotificationSection) => {
    if (!user?.uid) return;

    try {
      const firestore = db;
      if (!firestore) {
        return;
      }

      const notificationRef = doc(firestore, 'userNotifications', user.uid);
      await setDoc(
        notificationRef,
        {
          userId: user.uid,
          lastViewed: {
            [section]: Timestamp.now(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      // Mark as viewed error - silent fail
    }
  }, [user]);

  return {
    notificationCounts,
    markAsViewed,
  };
}
