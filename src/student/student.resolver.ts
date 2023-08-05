import {
  Context,
  GqlExecutionContext,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Friend } from 'src/friend/friend.entity';
import { Student } from './student.entity';
import { StudentService } from './student.service';
import { FriendService } from 'src/friend/friend.service';
import { GqlContext, useDataloader } from 'src/util';
import * as DataLoader from 'dataloader';

@Resolver(Student)
export class StudentResolver {
  constructor(
    private readonly studentService: StudentService,
    private readonly friendService: FriendService,
  ) {}

  @Query(() => [Student])
  async students() {
    return await this.studentService.getAll();
  }

  @ResolveField('friends', () => [Friend])
  getFriends(
    @Parent() student: Student,
    @GqlContext() context: GqlExecutionContext,
  ) {
    const studentId = student.id;
    const loader = useDataloader(
      context,
      'Student.friends',
      () =>
        new DataLoader<number, Friend>(
          async (keys: readonly number[]) =>
            await this.friendService.getStudentsFriendsByBatch(
              keys as number[],
            ),
        ),
    );
    return loader.load(studentId);
  }
}
