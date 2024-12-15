import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Release } from './Release';

@Entity()
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  githubId: number;

  @OneToMany(() => Release, release => release.repository, { cascade: true, onDelete: 'CASCADE' })
  releases: Release[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isArchived: boolean;

  getLatestRelease(): Release | undefined {
    if (!this.releases || this.releases.length === 0) {
      return undefined;
    }

    return this.releases.reduce((latest, current) => {
      if (!latest) return current;
      return new Date(current.releaseDate) > new Date(latest.releaseDate) ? current : latest;
    }, undefined as Release | undefined);
  }
}
