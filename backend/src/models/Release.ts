import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Repository } from './Repository';

@Entity()
export class Release {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  releaseDate: Date;

  @Column()
  githubId: string;

  @Column({ default: false })
  seen: boolean;

  @ManyToOne(() => Repository, repository => repository.releases, { onDelete: 'CASCADE' })
  repository: Repository;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    htmlUrl: string;
    tarballUrl?: string | null;
    zipballUrl?: string | null;
    draft: boolean;
    prerelease: boolean;
  };
}
