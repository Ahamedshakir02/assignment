import { PrismaClient, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Demo content mirroring the Figma frames, so a fresh database looks like the
// design rather than an empty screen.
async function main() {
  const demo = await prisma.user.upsert({
    where: { username: 'dexuser' },
    update: {},
    create: {
      isGuest: false,
      email: 'dexter@gmail.com',
      fullName: 'Dexter',
      title: 'Designer',
      username: 'dexuser',
    },
  });

  const labels = await Promise.all(
    ['Research', 'Design', 'Development', 'Testing', 'Deployment'].map((name) =>
      prisma.label.upsert({
        where: { ownerId_name: { ownerId: demo.id, name } },
        update: {},
        create: { name, ownerId: demo.id, color: 'neutral' },
      }),
    ),
  );

  const project = await prisma.project.create({
    data: {
      name: 'Design Homepage',
      priority: Priority.HIGH,
      dueDate: new Date('2026-09-12'),
      ownerId: demo.id,
      leadId: demo.id,
      order: 0,
    },
  });

  const rows: Array<[string, TaskStatus, Priority, string]> = [
    ['Design Homepage', TaskStatus.TODO, Priority.HIGH, '2026-09-12'],
    ['Develop Login Feature', TaskStatus.TODO, Priority.LOW, '2026-09-15'],
    ['Test Payment Gateway', TaskStatus.DOING, Priority.MEDIUM, '2026-09-18'],
    ['Code Review Completed', TaskStatus.DOING, Priority.MEDIUM, '2026-07-29'],
    ['Feature Testing Passed', TaskStatus.COMPLETED, Priority.LOW, '2026-07-30'],
    ['UI Design Updated', TaskStatus.COMPLETED, Priority.MEDIUM, '2026-07-31'],
    ['Security Audit Scheduled', TaskStatus.ON_HOLD, Priority.HIGH, '2026-08-01'],
  ];

  for (const [index, [title, status, priority, due]] of rows.entries()) {
    await prisma.task.create({
      data: {
        title,
        status,
        priority,
        dueDate: new Date(due),
        order: index,
        ownerId: demo.id,
        reporterId: demo.id,
        projectId: project.id,
        labels: { connect: [{ id: labels[index % labels.length].id }] },
      },
    });
  }

  // Task with subtasks, matching the detail screen in the design.
  const parent = await prisma.task.create({
    data: {
      title: 'Write API Documentation',
      description:
        'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
      status: TaskStatus.BACKLOG,
      priority: Priority.URGENT,
      startDate: new Date('2026-01-10'),
      order: 0,
      ownerId: demo.id,
      reporterId: demo.id,
      projectId: project.id,
      labels: { connect: labels.map((l) => ({ id: l.id })) },
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Subtask 1', priority: Priority.HIGH, dueDate: new Date('2026-09-12'), order: 0, ownerId: demo.id, parentTaskId: parent.id },
      { title: 'Subtask 2', priority: Priority.LOW, dueDate: new Date('2026-09-15'), order: 1, ownerId: demo.id, parentTaskId: parent.id },
      { title: 'Subtask 3', priority: Priority.MEDIUM, dueDate: new Date('2026-09-18'), order: 2, ownerId: demo.id, parentTaskId: parent.id },
    ],
  });

  await prisma.activity.create({
    data: {
      type: 'priority_changed',
      from: 'NONE',
      to: 'URGENT',
      taskId: parent.id,
      actorId: demo.id,
    },
  });

  console.log('Seeded demo workspace for', demo.fullName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
